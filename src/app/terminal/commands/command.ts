import type { Router } from '@angular/router';

import type { OutputBlock } from '../../core/models/terminal.model';
import type { PortfolioStore } from '../../core/state/portfolio-store';
import type { CommandRegistry } from '../services/command-registry';
import type { TerminalSession } from '../services/terminal-session';
import type { VirtualFileSystem } from '../services/virtual-file-system';

/** Tudo o que um comando pode usar durante a execução. */
export interface CommandContext {
  /** Argumentos já separados (aspas respeitadas). */
  readonly args: string[];
  /** Linha completa digitada. */
  readonly raw: string;
  readonly fs: VirtualFileSystem;
  readonly store: PortfolioStore;
  readonly registry: CommandRegistry;
  readonly session: TerminalSession;
  readonly router: Router;
}

/** Subconjunto do contexto disponível para o autocompletar. */
export type CompletionContext = Pick<CommandContext, 'fs' | 'store' | 'registry'>;

export type CommandOutput = OutputBlock[];

/**
 * Classe base de todos os comandos do terminal.
 *
 * Para criar um comando:
 * 1. crie `meu-comando.command.ts` estendendo `Command`;
 * 2. registre a instância em `commands/index.ts`.
 *
 * Comandos com `hidden = true` funcionam normalmente, mas não aparecem no
 * `help`, no autocompletar nem nas sugestões de "você quis dizer".
 */
export abstract class Command {
  abstract readonly name: string;
  abstract readonly description: string;
  /** Argumentos aceitos, exibidos no help. Ex.: `<arquivo>`, `[caminho]`. */
  readonly usage: string = '';
  readonly aliases: readonly string[] = [];
  readonly hidden: boolean = false;

  abstract execute(ctx: CommandContext): CommandOutput | Promise<CommandOutput>;

  /** Sugestões para o argumento sendo digitado (Tab). */
  complete(_partial: string, _ctx: CompletionContext): string[] {
    return [];
  }

  matches(name: string): boolean {
    const key = name.toLowerCase();
    return this.name === key || this.aliases.includes(key);
  }

  get signature(): string {
    return this.usage ? `${this.name} ${this.usage}` : this.name;
  }
}
