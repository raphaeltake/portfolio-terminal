import { Injectable } from '@angular/core';

import { levenshtein } from '../../core/utils/text.utils';
import type { Command } from '../commands/command';
import { createCommands } from '../commands';

/** Catálogo de comandos: busca por nome/apelido, autocompletar e sugestões. */
@Injectable({ providedIn: 'root' })
export class CommandRegistry {
  private readonly commands: readonly Command[] = createCommands();

  /** Encontra um comando pelo nome ou apelido (inclui ocultos). */
  find(name: string): Command | undefined {
    return this.commands.find((command) => command.matches(name));
  }

  /** Comandos públicos, na ordem de registro. */
  visible(): Command[] {
    return this.commands.filter((command) => !command.hidden);
  }

  /** Nomes de comandos públicos que começam com `partial`. */
  completeName(partial: string): string[] {
    const key = partial.toLowerCase();
    return this.visible()
      .map((command) => command.name)
      .filter((name) => name.startsWith(key));
  }

  /** Sugere o comando público mais parecido (para erros de digitação). */
  suggest(name: string): string | null {
    const key = name.toLowerCase();
    let best: { name: string; distance: number } | null = null;

    for (const command of this.visible()) {
      for (const candidate of [command.name, ...command.aliases]) {
        const distance = levenshtein(key, candidate);
        if (!best || distance < best.distance) best = { name: command.name, distance };
      }
    }

    const threshold = key.length <= 3 ? 1 : 2;
    return best && best.distance <= threshold ? best.name : null;
  }
}
