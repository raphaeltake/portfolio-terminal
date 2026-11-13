import { Injectable, computed, inject, signal } from '@angular/core';

import { EMPTY_PORTFOLIO, normalizePortfolioData } from '../data/portfolio-normalizer';
import { PortfolioRepository } from '../data/portfolio-repository';
import { PortfolioData, Profile, Project } from '../models/portfolio.model';

export type StoreStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Estado global do portfólio (perfil + projetos) baseado em signals.
 * Todas as leituras/escritas passam por aqui; a persistência é delegada
 * ao `PortfolioRepository` injetado.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioStore {
  private readonly repository = inject(PortfolioRepository);
  private readonly state = signal<PortfolioData>(EMPTY_PORTFOLIO);

  readonly status = signal<StoreStatus>('idle');
  readonly error = signal<string | null>(null);

  readonly data = this.state.asReadonly();
  readonly profile = computed(() => this.state().profile);
  readonly projects = computed(() => this.state().projects);

  async load(): Promise<void> {
    this.status.set('loading');
    try {
      this.state.set(await this.repository.load());
      this.status.set('ready');
      this.error.set(null);
    } catch (error) {
      this.status.set('error');
      this.error.set(messageOf(error, 'Falha ao carregar os dados do portfólio.'));
    }
  }

  /** Busca um projeto pelo slug (sem diferenciar maiúsculas) ou id. */
  findProject(slugOrId: string): Project | undefined {
    const key = slugOrId.trim().toLowerCase();
    return this.projects().find((p) => p.slug.toLowerCase() === key || p.id === slugOrId);
  }

  async updateProfile(profile: Profile): Promise<void> {
    await this.commit({ ...this.state(), profile });
  }

  /** Cria ou atualiza (pelo id) um projeto. */
  async saveProject(project: Project): Promise<void> {
    const projects = this.projects();
    const exists = projects.some((p) => p.id === project.id);
    const next = exists
      ? projects.map((p) => (p.id === project.id ? project : p))
      : [...projects, project];
    await this.commit({ ...this.state(), projects: next });
  }

  async deleteProject(id: string): Promise<void> {
    const projects = this.projects().filter((p) => p.id !== id);
    await this.commit({ ...this.state(), projects });
  }

  /** Move um projeto para cima (-1) ou para baixo (+1) na listagem. */
  async moveProject(id: string, offset: -1 | 1): Promise<void> {
    const projects = [...this.projects()];
    const from = projects.findIndex((p) => p.id === id);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= projects.length) return;
    [projects[from], projects[to]] = [projects[to], projects[from]];
    await this.commit({ ...this.state(), projects });
  }

  /** Substitui todos os dados (importação de JSON). */
  async importData(raw: unknown): Promise<void> {
    await this.commit(normalizePortfolioData(raw));
  }

  /** Descarta as edições locais e recarrega os dados iniciais. */
  async reset(): Promise<void> {
    this.state.set(await this.repository.reset());
  }

  exportJson(): string {
    return JSON.stringify(this.state(), null, 2);
  }

  private async commit(next: PortfolioData): Promise<void> {
    await this.repository.save(next);
    this.state.set(next);
  }
}

export function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
