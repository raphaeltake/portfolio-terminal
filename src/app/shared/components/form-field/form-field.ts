import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Campo de formulário padronizado: rótulo + controle projetado + dica/erro.
 * O `<label>` envolve o controle, então o clique no rótulo foca o input.
 *
 *   <app-form-field label="título" [error]="errorOf(form.controls.title)">
 *     <input class="input" formControlName="title" />
 *   </app-form-field>
 */
@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label class="field">
      <span class="field-label">{{ label() }}</span>
      <ng-content />
      @if (error()) {
        <span class="field-error" role="alert">{{ error() }}</span>
      } @else if (hint()) {
        <span class="field-hint">{{ hint() }}</span>
      }
    </label>
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly hint = input<string>('');
  readonly error = input<string | null>(null);
}
