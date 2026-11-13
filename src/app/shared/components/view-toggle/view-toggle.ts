import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { VIEW_SHORTCUT_LABEL, ViewSwitcher } from '../../../core/navigation/view-switcher';

/**
 * Botão que alterna entre o terminal e a interface gráfica (o mesmo que Ctrl+F1).
 * Necessário no celular e em teclados onde F1 é tecla de mídia.
 */
@Component({
  selector: 'app-view-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="btn btn-sm"
      aria-keyshortcuts="Control+F1"
      [title]="hint()"
      [attr.aria-label]="hint()"
      (click)="switcher.toggle()"
    >
      <span aria-hidden="true">{{ toGui() ? '▦' : '>_' }}</span>
      {{ toGui() ? 'modo gráfico' : 'modo terminal' }}
      <kbd class="hidden font-[inherit] text-xs text-muted sm:inline">{{ shortcut }}</kbd>
    </button>
  `,
})
export class ViewToggle {
  protected readonly switcher = inject(ViewSwitcher);
  protected readonly shortcut = VIEW_SHORTCUT_LABEL;

  /** Fora da GUI, o botão leva para ela. */
  protected readonly toGui = computed(() => this.switcher.current() !== 'gui');
  protected readonly hint = computed(
    () => `Alternar para ${this.toGui() ? 'a interface gráfica' : 'o terminal'} (Ctrl+F1)`,
  );
}
