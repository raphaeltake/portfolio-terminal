import { Out } from '../output';
import { Command, CommandContext, CommandOutput, CompletionContext } from './command';

/** Comandos utilitários do terminal: help, clear, historico, echo, data, banner. */

export class HelpCommand extends Command {
  readonly name = 'help';
  readonly description = 'Lista os comandos disponíveis (ou detalha um deles).';
  override readonly usage = '[comando]';
  override readonly aliases = ['ajuda', '?'];

  execute(ctx: CommandContext): CommandOutput {
    const [name] = ctx.args;

    if (name) {
      const command = ctx.registry.find(name);
      // Comandos ocultos nunca são revelados, nem pelo nome.
      if (!command || command.hidden) {
        return [Out.error(`help: nenhum comando chamado '${name}'.`)];
      }
      const output = [Out.text(command.signature, 'primary'), Out.text(command.description)];
      if (command.aliases.length) output.push(Out.muted(`Apelidos: ${command.aliases.join(', ')}`));
      return output;
    }

    return [
      Out.text('Comandos disponíveis:', 'primary'),
      Out.list(
        ctx.registry.visible().map((command) => ({
          label: command.signature,
          description: command.description,
          kind: 'command',
          command: command.name,
        })),
      ),
      Out.muted(
        'Dicas: Tab autocompleta · ↑/↓ navega no histórico · Ctrl+L limpa a tela · ' +
          'clique em um item para executá-lo.',
      ),
    ];
  }

  override complete(partial: string, ctx: CompletionContext): string[] {
    return ctx.registry.completeName(partial);
  }
}

export class ClearCommand extends Command {
  readonly name = 'clear';
  readonly description = 'Limpa a tela.';
  override readonly aliases = ['limpar', 'cls'];

  execute(ctx: CommandContext): CommandOutput {
    ctx.session.clear();
    return [];
  }
}

export class HistoryCommand extends Command {
  readonly name = 'historico';
  readonly description = 'Mostra os comandos digitados nesta sessão.';
  override readonly aliases = ['history'];

  execute(ctx: CommandContext): CommandOutput {
    const history = ctx.session.history();
    if (history.length === 0) return [Out.muted('(histórico vazio)')];

    const width = String(history.length).length;
    return [
      Out.list(
        history.map((line, i) => ({
          label: String(i + 1).padStart(width, ' '),
          description: line,
          command: line,
        })),
      ),
    ];
  }
}

export class EchoCommand extends Command {
  readonly name = 'echo';
  readonly description = 'Repete o texto informado.';
  override readonly usage = '<texto>';

  execute(ctx: CommandContext): CommandOutput {
    return [Out.text(ctx.args.join(' '))];
  }
}

export class DateCommand extends Command {
  readonly name = 'data';
  readonly description = 'Mostra a data e a hora atuais.';
  override readonly aliases = ['date'];

  execute(): CommandOutput {
    const now = new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'medium' });
    return [Out.text(now)];
  }
}

export class BannerCommand extends Command {
  readonly name = 'banner';
  readonly description = 'Mostra a mensagem de boas-vindas novamente.';
  override readonly aliases = ['welcome'];

  execute(ctx: CommandContext): CommandOutput {
    return [Out.banner(ctx.store.profile())];
  }
}
