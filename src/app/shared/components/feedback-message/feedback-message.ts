import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { FeedbackMessage as Message } from '../../utils/feedback';

/** Exibe a mensagem atual de um `Feedback` (sucesso/erro). */
@Component({
  selector: 'app-feedback-message',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as msg) {
      <p class="alert" [class.alert-error]="msg.tone === 'error'" role="status" aria-live="polite">
        {{ msg.tone === 'error' ? '✗' : '✓' }} {{ msg.text }}
      </p>
    }
  `,
})
export class FeedbackMessage {
  readonly message = input<Message | null>(null);
}
