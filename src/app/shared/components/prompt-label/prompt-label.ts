import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TERMINAL_CONFIG } from '../../../core/config/terminal.config';

/** Prompt no estilo bash: `visitante@portfolio:~/projetos$`. */
@Component({
  selector: 'app-prompt-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'whitespace-nowrap select-none' },
  template: `<span class="font-bold text-primary">{{ user() }}&#64;{{ host() }}</span
    ><span class="text-ink">:</span><span class="text-info">{{ path() }}</span
    ><span class="text-ink">{{ symbol() }}</span>`,
})
export class PromptLabel {
  readonly user = input<string>(TERMINAL_CONFIG.user);
  readonly host = input<string>(TERMINAL_CONFIG.host);
  readonly path = input('~');
  readonly symbol = input('$');
}
