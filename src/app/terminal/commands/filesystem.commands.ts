import type { ListItem } from '../../core/models/terminal.model';
import { Out } from '../output';
import type { FsNode, VirtualFileSystem } from '../services/virtual-file-system';
import { Command, CommandContext, CommandOutput, CompletionContext } from './command';

/** Comandos de navegação no sistema de arquivos virtual: ls, cd, pwd, cat. */

export class LsCommand extends Command {
  readonly name = 'ls';
  readonly description = 'Lista arquivos e diretórios.';
  override readonly usage = '[caminho]';
  override readonly aliases = ['dir', 'll'];

  execute(ctx: CommandContext): CommandOutput {
    // Flags como -la são aceitas e ignoradas.
    const path = ctx.args.find((arg) => !arg.startsWith('-')) ?? '.';
    const found = ctx.fs.lookup(path);
    if (!found)
      return [
        Out.error(`ls: não foi possível acessar '${path}': Arquivo ou diretório inexistente`),
      ];

    const { node, segments } = found;
    if (node.kind === 'file')
      return [Out.list([toListItem(node, segments.slice(0, -1), ctx.fs)], 'inline')];
    if (node.children.length === 0) return [Out.muted('(diretório vazio)')];

    const items = node.children.map((child) => toListItem(child, segments, ctx.fs));
    return [Out.list(items, 'inline')];
  }

  override complete(partial: string, ctx: CompletionContext): string[] {
    return ctx.fs.complete(partial);
  }
}

export class CdCommand extends Command {
  readonly name = 'cd';
  readonly description = 'Entra em um diretório (sem argumento volta para ~).';
  override readonly usage = '[caminho]';

  execute(ctx: CommandContext): CommandOutput {
    const error = ctx.fs.changeDirectory(ctx.args[0] ?? '');
    return error ? [Out.error(error)] : [];
  }

  override complete(partial: string, ctx: CompletionContext): string[] {
    return ctx.fs.complete(partial, true);
  }
}

export class PwdCommand extends Command {
  readonly name = 'pwd';
  readonly description = 'Mostra o diretório atual.';

  execute(ctx: CommandContext): CommandOutput {
    return [Out.text(ctx.fs.toAbsolute(ctx.fs.cwd()))];
  }
}

export class CatCommand extends Command {
  readonly name = 'cat';
  readonly description = 'Mostra o conteúdo de um arquivo.';
  override readonly usage = '<arquivo>';
  override readonly aliases = ['abrir', 'open'];

  execute(ctx: CommandContext): CommandOutput {
    const [path] = ctx.args;
    if (!path) return [Out.error(`Uso: ${this.signature}`)];

    const found = ctx.fs.lookup(path);
    if (!found) return [Out.error(`cat: ${path}: Arquivo ou diretório inexistente`)];
    if (found.node.kind === 'dir') return [Out.error(`cat: ${path}: É um diretório`)];
    return found.node.read();
  }

  override complete(partial: string, ctx: CompletionContext): string[] {
    return ctx.fs.complete(partial);
  }
}

/** Item clicável do `ls`: diretório -> cd, projeto -> visualizar, arquivo -> cat. */
function toListItem(node: FsNode, parent: string[], fs: VirtualFileSystem): ListItem {
  const path = fs.toDisplay([...parent, node.name]);

  if (node.kind === 'dir') {
    return { label: `${node.name}/`, kind: 'dir', command: `cd ${path}` };
  }
  if (node.project) {
    return {
      label: node.name,
      kind: 'project',
      command: `visualizar-projeto ${node.project.slug}`,
    };
  }
  return { label: node.name, kind: 'file', command: `cat ${path}` };
}
