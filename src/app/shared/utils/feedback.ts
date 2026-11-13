import { signal } from '@angular/core';

export interface FeedbackMessage {
  text: string;
  tone: 'success' | 'error';
}

/**
 * Estado reutilizável de mensagens de retorno para formulários.
 * Mensagens de sucesso somem sozinhas; erros ficam até a próxima ação.
 *
 *   readonly feedback = new Feedback();
 *   this.feedback.success('Salvo!');
 *   <app-feedback-message [message]="feedback.message()" />
 */
export class Feedback {
  private readonly state = signal<FeedbackMessage | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly message = this.state.asReadonly();

  constructor(private readonly autoHideMs = 4000) {}

  success(text: string): void {
    this.show({ text, tone: 'success' });
    this.timer = setTimeout(() => this.clear(), this.autoHideMs);
  }

  error(text: string): void {
    this.show({ text, tone: 'error' });
  }

  clear(): void {
    clearTimeout(this.timer);
    this.state.set(null);
  }

  private show(message: FeedbackMessage): void {
    clearTimeout(this.timer);
    this.state.set(message);
  }
}
