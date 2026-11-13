import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Botão que executa um comando no terminal ao ser clicado: `$ help`. */
@Component({
  selector: 'app-command-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="chip" (click)="run.emit(command())">
      <span class="text-muted" aria-hidden="true">$</span>{{ command() }}
    </button>
  `,
})
export class CommandChip {
  readonly command = input.required<string>();
  readonly run = output<string>();
}
