import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Moldura de janela de terminal (barra de título com os três "botões").
 * Reutilizada pelo terminal, pelo login e pelo painel administrativo.
 *
 * Uso:
 *   <app-terminal-window title="root@portfolio: ~">
 *     <button windowActions>...</button>   <!-- opcional, lado direito -->
 *     conteúdo...
 *   </app-terminal-window>
 */
@Component({
  selector: 'app-terminal-window',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'panel flex min-h-0 flex-col overflow-hidden shadow-[0_0_40px_-12px_var(--color-primary-dim)]',
  },
  template: `
    <header class="flex items-center gap-3 border-b border-line bg-elevated px-3 py-2">
      <div class="flex shrink-0 gap-1.5" aria-hidden="true">
        <span class="size-3 rounded-full bg-danger/80"></span>
        <span class="size-3 rounded-full bg-warning/80"></span>
        <span class="size-3 rounded-full bg-primary/80"></span>
      </div>
      <p class="min-w-0 flex-1 truncate text-center text-xs text-muted">{{ title() }}</p>
      <div class="flex shrink-0 items-center gap-2">
        <ng-content select="[windowActions]" />
      </div>
    </header>
    <div class="flex min-h-0 flex-1 flex-col">
      <ng-content />
    </div>
  `,
})
export class TerminalWindow {
  readonly title = input('');
}
