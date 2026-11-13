import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { TERMINAL_CONFIG } from '../../core/config/terminal.config';
import type { OutputBlock, TerminalEntry } from '../../core/models/terminal.model';
import { PortfolioStore, messageOf } from '../../core/state/portfolio-store';
import { commonPrefix } from '../../core/utils/text.utils';
import type { CommandContext } from '../commands/command';
import { Out } from '../output';
import { parseCommandLine } from './command-parser';
import { CommandRegistry } from './command-registry';
import { VirtualFileSystem } from './virtual-file-system';

export interface CompletionResult {
  /** Linha após aplicar o autocompletar. */
  line: string;
  /** Opções quando há mais de uma possibilidade. */
  options: string[];
}

/**
 * Sessão do terminal: histórico de saída, histórico de comandos, execução e
 * autocompletar. É `providedIn: 'root'` para manter a tela ao ir e voltar do
 * painel administrativo.
 */
@Injectable({ providedIn: 'root' })
export class TerminalSession {
  private readonly registry = inject(CommandRegistry);
  private readonly fs = inject(VirtualFileSystem);
  private readonly store = inject(PortfolioStore);
  private readonly router = inject(Router);

  private nextId = 1;
  private started = false;

  readonly entries = signal<TerminalEntry[]>([]);
  readonly history = signal<string[]>([]);
  readonly busy = signal(false);

  /** Exibe a mensagem de boas-vindas apenas na primeira visita da sessão. */
  start(): void {
    if (this.started) return;
    this.started = true;

    const error = this.store.error();
    this.print(
      error
        ? [Out.error(error), Out.muted("Digite 'help' para ver os comandos.")]
        : [Out.banner(this.store.profile())],
    );
  }

  /** Executa uma linha digitada (ou clicada) pelo usuário. */
  async execute(line: string): Promise<void> {
    const trimmed = line.trim();
    const id = this.push({ path: this.fs.displayCwd(), input: line, output: [] });
    if (!trimmed) return;

    this.addToHistory(trimmed);
    const parsed = parseCommandLine(trimmed);
    if (!parsed) return;

    const command = this.registry.find(parsed.name);
    let output: OutputBlock[];

    if (!command) {
      output = this.notFound(parsed.name);
    } else {
      this.busy.set(true);
      try {
        output = await command.execute(this.context(parsed.args, trimmed));
      } catch (error) {
        output = [Out.error(`${parsed.name}: ${messageOf(error, 'erro inesperado.')}`)];
      } finally {
        this.busy.set(false);
      }
    }

    // Se o comando limpou a tela (clear), a entrada não existe mais: nada a fazer.
    this.entries.update((list) =>
      list.map((entry) => (entry.id === id ? { ...entry, output } : entry)),
    );
  }

  /** Mostra blocos sem prompt (mensagens do sistema). */
  print(output: OutputBlock[]): void {
    this.push({ path: this.fs.displayCwd(), input: null, output });
  }

  clear(): void {
    this.entries.set([]);
  }

  /** Mostra a linha atual seguida de `^C`, como ao cancelar no bash. */
  cancel(line: string): void {
    this.push({ path: this.fs.displayCwd(), input: `${line}^C`, output: [] });
  }

  /** Lista as opções de autocompletar abaixo da linha atual (Tab com várias opções). */
  showCompletions(line: string, options: string[]): void {
    const names = options.map((option) => {
      const isDir = option.endsWith('/');
      const name = option.replace(/\/$/, '').split('/').pop() ?? option;
      return { label: isDir ? `${name}/` : name, kind: isDir ? ('dir' as const) : undefined };
    });
    this.push({ path: this.fs.displayCwd(), input: line, output: [Out.list(names, 'inline')] });
  }

  /** Autocompletar estilo bash para a linha atual. */
  complete(line: string): CompletionResult {
    const leading = line.length - line.trimStart().length;
    const body = line.slice(leading);
    const firstSpace = body.search(/\s/);

    // Ainda digitando o nome do comando.
    if (firstSpace === -1) {
      return this.applyCompletion(line, body, this.registry.completeName(body), ' ');
    }

    const command = this.registry.find(body.slice(0, firstSpace));
    if (!command || command.hidden) return { line, options: [] };

    const partial = line.slice(line.lastIndexOf(' ') + 1);
    const options = command.complete(partial, {
      fs: this.fs,
      store: this.store,
      registry: this.registry,
    });
    return this.applyCompletion(line, partial, options, ' ');
  }

  private applyCompletion(
    line: string,
    partial: string,
    options: string[],
    suffix: string,
  ): CompletionResult {
    const base = line.slice(0, line.length - partial.length);

    if (options.length === 0) return { line, options: [] };
    if (options.length === 1) {
      const [only] = options;
      return { line: base + only + (only.endsWith('/') ? '' : suffix), options: [] };
    }

    const prefix = commonPrefix(options);
    return {
      line: prefix.length > partial.length ? base + prefix : line,
      options,
    };
  }

  private context(args: string[], raw: string): CommandContext {
    return {
      args,
      raw,
      fs: this.fs,
      store: this.store,
      registry: this.registry,
      session: this,
      router: this.router,
    };
  }

  private notFound(name: string): OutputBlock[] {
    const output: OutputBlock[] = [Out.error(`${name}: comando não encontrado`)];
    const suggestion = this.registry.suggest(name);
    output.push(
      suggestion
        ? Out.commands('Você quis dizer:', [suggestion])
        : Out.muted("Digite 'help' para ver os comandos disponíveis."),
    );
    return output;
  }

  private push(entry: Omit<TerminalEntry, 'id'>): number {
    const id = this.nextId++;
    this.entries.update((list) => [...list, { ...entry, id }]);
    return id;
  }

  private addToHistory(line: string): void {
    this.history.update((list) => {
      const next = list[list.length - 1] === line ? list : [...list, line];
      return next.slice(-TERMINAL_CONFIG.historyLimit);
    });
  }
}
