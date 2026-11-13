import { Out } from '../output';
import { Command, CommandContext, CommandOutput } from './command';

/**
 * Comandos ocultos: funcionam, mas não aparecem no `help`, no autocompletar
 * nem nas sugestões de comandos.
 */

/** Leva ao login do painel administrativo. */
export class EditInfoCommand extends Command {
  readonly name = 'edit-infos-minhas';
  readonly description = 'Abre o login do painel de edição.';
  override readonly hidden = true;

  execute(ctx: CommandContext): CommandOutput {
    setTimeout(() => void ctx.router.navigate(['/login']), 600);
    return [Out.warning('Acesso restrito. Redirecionando para autenticação...')];
  }
}

/** Easter egg. */
export class SudoCommand extends Command {
  readonly name = 'sudo';
  readonly description = 'Easter egg.';
  override readonly hidden = true;

  execute(): CommandOutput {
    return [Out.error('visitante não está no arquivo sudoers. Este incidente será reportado.')];
  }
}
