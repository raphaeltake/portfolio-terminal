import { aboutContent, contactContent, Out, projectListContent, resumeContent } from '../output';
import { Command, CommandContext, CommandOutput, CompletionContext } from './command';
import { levenshtein } from '../../core/utils/text.utils';

/** Comandos de conteúdo do portfólio: sobre, currículo, contato e projetos. */

export class AboutCommand extends Command {
  readonly name = 'sobre';
  readonly description = 'Quem sou eu: resumo, habilidades e links.';
  override readonly aliases = ['whoami'];

  execute(ctx: CommandContext): CommandOutput {
    return aboutContent(ctx.store.profile());
  }
}

export class ResumeCommand extends Command {
  readonly name = 'curriculo';
  readonly description = 'Exibe meu currículo: experiência, formação e habilidades.';
  override readonly aliases = ['cv', 'resume'];

  execute(ctx: CommandContext): CommandOutput {
    return resumeContent(ctx.store.profile());
  }
}

export class ContactCommand extends Command {
  readonly name = 'contato';
  readonly description = 'Formas de entrar em contato comigo.';
  override readonly aliases = ['contact'];

  execute(ctx: CommandContext): CommandOutput {
    return contactContent(ctx.store.profile());
  }
}

export class ProjectsCommand extends Command {
  readonly name = 'projetos';
  readonly description = 'Lista todos os projetos.';
  override readonly aliases = ['projects'];

  execute(ctx: CommandContext): CommandOutput {
    return projectListContent(ctx.store.projects());
  }
}

export class ViewProjectCommand extends Command {
  readonly name = 'visualizar-projeto';
  readonly description = 'Abre um projeto: imagem, título, descrição e link.';
  override readonly usage = '<nome>';
  override readonly aliases = ['vp', 'ver'];

  execute(ctx: CommandContext): CommandOutput {
    const [arg] = ctx.args;
    const projects = ctx.store.projects();

    if (!arg) {
      return [Out.muted(`Uso: ${this.signature}`), ...projectListContent(projects)];
    }

    // Aceita tanto `slug` quanto caminhos como `~/projetos/slug`.
    const slug = arg.replace(/\/+$/, '').split('/').pop() ?? arg;
    const project = ctx.store.findProject(slug);
    if (project) return [Out.project(project)];

    const closest = projects
      .map((p) => ({ slug: p.slug, distance: levenshtein(slug.toLowerCase(), p.slug) }))
      .sort((a, b) => a.distance - b.distance)[0];

    const output: CommandOutput = [
      Out.error(`visualizar-projeto: projeto '${slug}' não encontrado.`),
    ];
    if (closest && closest.distance <= 3) {
      output.push(Out.commands('Você quis dizer:', [`visualizar-projeto ${closest.slug}`]));
    } else {
      output.push(Out.muted("Digite 'projetos' para ver a lista."));
    }
    return output;
  }

  override complete(partial: string, ctx: CompletionContext): string[] {
    const key = partial.toLowerCase();
    return ctx.store
      .projects()
      .map((p) => p.slug)
      .filter((slug) => slug.startsWith(key));
  }
}
