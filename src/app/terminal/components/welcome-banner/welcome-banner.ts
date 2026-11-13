import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { Profile } from '../../../core/models/portfolio.model';
import { CommandChip } from '../../../shared/components/command-chip/command-chip';

const ASCII_ART = String.raw`
██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝`.slice(1);

/** Mensagem de boas-vindas exibida ao abrir o terminal (e pelo comando `banner`). */
@Component({
  selector: 'app-welcome-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommandChip],
  template: `
    <section class="space-y-3 py-1">
      <pre class="ascii-art glow" aria-hidden="true">{{ art }}</pre>
      <p>
        Bem-vindo(a) ao portfólio de
        <span class="font-bold text-primary">{{ profile().name || 'visitante' }}</span>
        @if (profile().role) {
          <span class="text-muted"> — {{ profile().role }}</span>
        }
      </p>
      <p class="text-muted">
        Digite <span class="text-primary">help</span> para ver os comandos ou clique em um atalho:
      </p>
      <div class="flex flex-wrap gap-2">
        @for (command of shortcuts; track command) {
          <app-command-chip [command]="command" (run)="run.emit($event)" />
        }
      </div>
    </section>
  `,
})
export class WelcomeBanner {
  readonly profile = input.required<Profile>();
  readonly run = output<string>();

  protected readonly art = ASCII_ART;
  protected readonly shortcuts = ['help', 'sobre', 'projetos', 'curriculo', 'contato', 'ls'];
}
