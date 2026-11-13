import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { TerminalEntry } from '../../../core/models/terminal.model';
import { PromptLabel } from '../../../shared/components/prompt-label/prompt-label';
import { OutputBlockView } from '../output-block/output-block';

/** Histórico visível do terminal: cada entrada = prompt + comando + saída. */
@Component({
  selector: 'app-terminal-output',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PromptLabel, OutputBlockView],
  host: { class: 'block', 'aria-live': 'polite' },
  template: `
    @for (entry of entries(); track entry.id) {
      <div class="mb-3">
        @if (entry.input !== null) {
          <p class="flex flex-wrap gap-x-2">
            <app-prompt-label [path]="entry.path" />
            <span class="break-all">{{ entry.input }}</span>
          </p>
        }
        @for (block of entry.output; track $index) {
          <app-output-block class="mt-1" [block]="block" (run)="run.emit($event)" />
        }
      </div>
    }
  `,
})
export class TerminalOutput {
  readonly entries = input.required<TerminalEntry[]>();
  readonly run = output<string>();
}
