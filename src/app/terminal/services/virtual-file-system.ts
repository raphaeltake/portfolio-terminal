import { Injectable, computed, inject, signal } from '@angular/core';

import { TERMINAL_CONFIG } from '../../core/config/terminal.config';
import type { Profile, Project } from '../../core/models/portfolio.model';
import type { OutputBlock } from '../../core/models/terminal.model';
import { PortfolioStore } from '../../core/state/portfolio-store';
import {
  aboutContent,
  certificatesContent,
  contactContent,
  Out,
  readmeContent,
  resumeContent,
} from '../output';

export interface FsFile {
  kind: 'file';
  name: string;
  /** Projeto associado (arquivos dentro de ~/projetos). */
  project?: Project;
  read(): OutputBlock[];
}

export interface FsDirectory {
  kind: 'dir';
  name: string;
  children: FsNode[];
}

export type FsNode = FsFile | FsDirectory;

/**
 * Sistema de arquivos virtual usado por `ls`, `cd`, `cat` e `pwd`.
 * A árvore é derivada do `PortfolioStore`, então projetos criados no painel
 * aparecem automaticamente em `~/projetos`.
 *
 * /
 * └── home/
 *     └── visitante/        (~)
 *         ├── README.md
 *         ├── sobre.txt
 *         ├── curriculo.txt
 *         ├── certificados.txt
 *         ├── contato.txt
 *         └── projetos/
 *             └── <slug-do-projeto>
 */
@Injectable({ providedIn: 'root' })
export class VirtualFileSystem {
  private readonly store = inject(PortfolioStore);
  private readonly home = [...TERMINAL_CONFIG.home];
  private readonly cwdSegments = signal<string[]>([...this.home]);

  readonly root = computed(() => buildTree(this.store.profile(), this.store.projects()));
  readonly cwd = this.cwdSegments.asReadonly();
  readonly displayCwd = computed(() => this.toDisplay(this.cwdSegments()));

  /** Converte um caminho (relativo, absoluto ou com ~) em segmentos absolutos. */
  resolve(path: string, from: readonly string[] = this.cwdSegments()): string[] {
    const trimmed = path.trim();
    let segments: string[];
    let rest: string;

    if (trimmed === '~' || trimmed.startsWith('~/')) {
      segments = [...this.home];
      rest = trimmed.slice(1);
    } else if (trimmed.startsWith('/')) {
      segments = [];
      rest = trimmed;
    } else {
      segments = [...from];
      rest = trimmed;
    }

    for (const part of rest.split('/')) {
      if (!part || part === '.') continue;
      if (part === '..') segments.pop();
      else segments.push(part);
    }
    return segments;
  }

  /** Encontra o nó pelos segmentos absolutos (nomes sem diferenciar maiúsculas). */
  getNode(segments: readonly string[]): FsNode | null {
    let node: FsNode = this.root();
    for (const segment of segments) {
      if (node.kind !== 'dir') return null;
      const next: FsNode | undefined = node.children.find(
        (child) => child.name.toLowerCase() === segment.toLowerCase(),
      );
      if (!next) return null;
      node = next;
    }
    return node;
  }

  /** Resolve e busca o nó em um passo. */
  lookup(path: string): { node: FsNode; segments: string[] } | null {
    const segments = this.resolve(path);
    const node = this.getNode(segments);
    return node ? { node, segments } : null;
  }

  /** Muda o diretório atual. Retorna uma mensagem de erro ou `null` se deu certo. */
  changeDirectory(path: string): string | null {
    const target = path.trim() ? path : '~';
    const found = this.lookup(target);
    if (!found) return `cd: ${path}: Arquivo ou diretório inexistente`;
    if (found.node.kind !== 'dir') return `cd: ${path}: Não é um diretório`;
    this.cwdSegments.set(this.canonical(found.segments));
    return null;
  }

  /** Caminho amigável: `/home/visitante/projetos` -> `~/projetos`. */
  toDisplay(segments: readonly string[]): string {
    const inHome = this.home.every((part, i) => segments[i] === part);
    if (inHome) {
      const rest = segments.slice(this.home.length);
      return rest.length ? `~/${rest.join('/')}` : '~';
    }
    return `/${segments.join('/')}`;
  }

  toAbsolute(segments: readonly string[]): string {
    return `/${segments.join('/')}`;
  }

  /** Sugestões de caminho para o autocompletar (Tab). */
  complete(partial: string, onlyDirectories = false): string[] {
    if (partial === '~') return ['~/'];

    const slash = partial.lastIndexOf('/');
    const dirPart = slash >= 0 ? partial.slice(0, slash + 1) : '';
    const base = partial.slice(slash + 1).toLowerCase();
    const dir = this.getNode(this.resolve(dirPart || '.'));
    if (!dir || dir.kind !== 'dir') return [];

    return dir.children
      .filter((child) => child.name.toLowerCase().startsWith(base))
      .filter((child) => !onlyDirectories || child.kind === 'dir')
      .map((child) => dirPart + child.name + (child.kind === 'dir' ? '/' : ''));
  }

  /** Volta para a home (usado ao reiniciar a sessão). */
  goHome(): void {
    this.cwdSegments.set([...this.home]);
  }

  /** Normaliza maiúsculas/minúsculas usando os nomes reais da árvore. */
  private canonical(segments: string[]): string[] {
    const result: string[] = [];
    let node: FsNode = this.root();
    for (const segment of segments) {
      if (node.kind !== 'dir') break;
      const next: FsNode | undefined = node.children.find(
        (c) => c.name.toLowerCase() === segment.toLowerCase(),
      );
      if (!next) break;
      result.push(next.name);
      node = next;
    }
    return result;
  }
}

function file(name: string, read: () => OutputBlock[], project?: Project): FsFile {
  return { kind: 'file', name, read, project };
}

function dir(name: string, children: FsNode[]): FsDirectory {
  return { kind: 'dir', name, children };
}

function buildTree(profile: Profile, projects: Project[]): FsDirectory {
  const [homeParent, user] = TERMINAL_CONFIG.home;

  const projectFiles = projects.map((project) =>
    file(project.slug, () => [Out.project(project)], project),
  );

  const home = dir(user, [
    file('README.md', readmeContent),
    file('sobre.txt', () => aboutContent(profile)),
    file('curriculo.txt', () => resumeContent(profile)),
    file('certificados.txt', () => certificatesContent(profile)),
    file('contato.txt', () => contactContent(profile)),
    dir(TERMINAL_CONFIG.projectsDir, projectFiles),
  ]);

  return dir('', [dir(homeParent, [home])]);
}
