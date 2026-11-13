import type { Profile, Project, SocialLink } from '../core/models/portfolio.model';
import type {
  ListBlock,
  ListItem,
  OutputBlock,
  TextBlock,
  TextTone,
} from '../core/models/terminal.model';

/**
 * Fábricas de blocos de saída. Use sempre estas funções nos comandos para
 * manter a saída tipada e consistente.
 */
export const Out = {
  text: (text: string, tone: TextTone = 'default'): TextBlock => ({ type: 'text', text, tone }),
  muted: (text: string): TextBlock => Out.text(text, 'muted'),
  success: (text: string): TextBlock => Out.text(text, 'success'),
  warning: (text: string): TextBlock => Out.text(text, 'warning'),
  error: (text: string): TextBlock => Out.text(text, 'error'),
  list: (items: ListItem[], layout: ListBlock['layout'] = 'rows'): ListBlock => ({
    type: 'list',
    layout,
    items,
  }),
  links: (links: SocialLink[]): OutputBlock => ({ type: 'links', links }),
  commands: (label: string, commands: string[]): OutputBlock => ({
    type: 'commands',
    label,
    commands,
  }),
  project: (project: Project): OutputBlock => ({ type: 'project', project }),
  profile: (profile: Profile): OutputBlock => ({ type: 'profile', profile }),
  resume: (profile: Profile): OutputBlock => ({ type: 'resume', profile }),
  banner: (profile: Profile): OutputBlock => ({ type: 'banner', profile }),
};

/* ------------------------------------------------------------------------
 * Conteúdos compartilhados entre comandos e arquivos do sistema virtual
 * (ex.: `contato` e `cat contato.txt` mostram a mesma coisa).
 * ---------------------------------------------------------------------- */

export function aboutContent(profile: Profile): OutputBlock[] {
  return [Out.profile(profile)];
}

export function resumeContent(profile: Profile): OutputBlock[] {
  return [Out.resume(profile)];
}

export function contactContent(profile: Profile): OutputBlock[] {
  const links: SocialLink[] = [];
  if (profile.email) links.push({ label: 'E-mail', url: `mailto:${profile.email}` });
  links.push(...profile.links);

  return links.length
    ? [Out.text('Onde me encontrar:', 'primary'), Out.links(links)]
    : [Out.muted('Nenhum contato cadastrado ainda.')];
}

export function projectListContent(projects: Project[]): OutputBlock[] {
  if (projects.length === 0) return [Out.muted('Nenhum projeto cadastrado ainda.')];

  return [
    Out.list(
      projects.map((project) => ({
        label: project.slug,
        description: project.title,
        kind: 'project',
        command: `visualizar-projeto ${project.slug}`,
      })),
    ),
    Out.muted("Use 'visualizar-projeto <nome>' ou clique em um projeto para abrir."),
  ];
}

export function readmeContent(): OutputBlock[] {
  return [
    Out.text('# README', 'primary'),
    Out.text(
      'Este é um portfólio em forma de terminal. Navegue pelos diretórios com ' +
        "'ls' e 'cd', leia arquivos com 'cat' ou use os atalhos abaixo.",
    ),
    Out.commands('Comece por:', ['help', 'sobre', 'projetos', 'curriculo', 'contato']),
  ];
}
