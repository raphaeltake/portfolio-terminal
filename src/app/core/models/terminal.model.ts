import type { Certificate, Profile, Project, SocialLink } from './portfolio.model';

/** Tons de cor disponíveis para blocos de texto (classes `.tone-*`). */
export type TextTone = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error';

export interface TextBlock {
  type: 'text';
  text: string;
  tone: TextTone;
}

export type ListItemKind = 'dir' | 'file' | 'project' | 'command';

export interface ListItem {
  label: string;
  description?: string;
  kind?: ListItemKind;
  /** Comando executado ao clicar no item (opcional). */
  command?: string;
}

export interface ListBlock {
  type: 'list';
  /** `inline`: itens lado a lado (ex.: `ls`). `rows`: um por linha com descrição. */
  layout: 'inline' | 'rows';
  items: ListItem[];
}

export interface LinksBlock {
  type: 'links';
  links: SocialLink[];
}

export interface CommandsBlock {
  type: 'commands';
  label: string;
  commands: string[];
}

export interface ProjectBlock {
  type: 'project';
  project: Project;
}

export interface ProfileBlock {
  type: 'profile';
  profile: Profile;
}

export interface ResumeBlock {
  type: 'resume';
  profile: Profile;
}

export interface CertificatesBlock {
  type: 'certificates';
  certificates: Certificate[];
}

export interface BannerBlock {
  type: 'banner';
  profile: Profile;
}

/**
 * Saída tipada de um comando. Cada tipo é renderizado por um componente,
 * nunca via `innerHTML` (o conteúdo é editável pelo usuário).
 */
export type OutputBlock =
  | TextBlock
  | ListBlock
  | LinksBlock
  | CommandsBlock
  | ProjectBlock
  | ProfileBlock
  | ResumeBlock
  | CertificatesBlock
  | BannerBlock;

/** Uma "rodada" no histórico do terminal: prompt + comando + saída. */
export interface TerminalEntry {
  id: number;
  /** Caminho exibido no prompt no momento da execução (ex.: `~/projetos`). */
  path: string;
  /** Linha digitada. `null` para mensagens sem prompt (ex.: boas-vindas). */
  input: string | null;
  output: OutputBlock[];
}
