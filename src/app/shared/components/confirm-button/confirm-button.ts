import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Botão destrutivo com confirmação em dois cliques (sem `window.confirm`).
 * O primeiro clique "arma" o botão por alguns segundos; o segundo confirma.
 */
@Component({
  selector: 'app-confirm-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="btn btn-sm btn-danger" [disabled]="disabled()" (click)="onClick()">
      {{ armed() ? confirmLabel() : label() }}
    </button>
  `,
})
export class ConfirmButton {
  readonly label = input.required<string>();
  readonly confirmLabel = input('confirmar?');
  readonly disabled = input(false);
  readonly confirmed = output<void>();

  protected readonly armed = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected onClick(): void {
    clearTimeout(this.timer);
    if (this.armed()) {
      this.armed.set(false);
      this.confirmed.emit();
      return;
    }
    this.armed.set(true);
    this.timer = setTimeout(() => this.armed.set(false), 4000);
  }
}
