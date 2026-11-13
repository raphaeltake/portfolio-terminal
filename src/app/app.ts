import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ViewSwitcher } from './core/navigation/view-switcher';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  host: {
    // Ctrl+F1 alterna terminal ↔ interface gráfica em qualquer tela do portfólio.
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class App {
  protected readonly switcher = inject(ViewSwitcher);

  /**
   * Não devolve o resultado de `handleKeydown`: o Angular chama `preventDefault()`
   * quando um listener do template retorna `false`, o que bloquearia toda a digitação.
   */
  protected onKeydown(event: KeyboardEvent): void {
    this.switcher.handleKeydown(event);
  }
}
