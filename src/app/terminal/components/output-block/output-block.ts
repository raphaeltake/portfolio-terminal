import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { ListItemKind, OutputBlock } from '../../../core/models/terminal.model';
import { CommandChip } from '../../../shared/components/command-chip/command-chip';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { ProfileView } from '../profile-view/profile-view';
import { ResumeView } from '../resume-view/resume-view';
import { WelcomeBanner } from '../welcome-banner/welcome-banner';

const KIND_CLASS: Record<ListItemKind, string> = {
  dir: 'font-bold text-info',
  project: 'text-primary',
  command: 'text-primary',
  file: 'text-ink',
};

/** Renderiza um bloco de saída de comando de acordo com o seu tipo. */
@Component({
  selector: 'app-output-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommandChip, ProjectCard, ProfileView, ResumeView, WelcomeBanner],
  host: { class: 'block' },
  templateUrl: './output-block.html',
})
export class OutputBlockView {
  readonly block = input.required<OutputBlock>();
  /** Emitido quando o usuário clica em algo que executa um comando. */
  readonly run = output<string>();

  protected kindClass(kind: ListItemKind | undefined): string {
    return KIND_CLASS[kind ?? 'file'];
  }

  /** Mostra a URL sem protocolo: `https://github.com/x` -> `github.com/x`. */
  protected displayUrl(url: string): string {
    return url
      .replace(/^mailto:/, '')
      .replace(/^https?:\/\//, '')
      .replace(/\/$/, '');
  }
}
