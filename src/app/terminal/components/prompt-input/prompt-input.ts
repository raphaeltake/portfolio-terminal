import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { PromptLabel } from '../../../shared/components/prompt-label/prompt-label';
import { TerminalSession } from '../../services/terminal-session';

/**
 * Linha de comando editável. Atalhos:
 * Enter executa · ↑/↓ histórico · Tab autocompleta · Ctrl+L limpa · Ctrl+C cancela.
 */
@Component({
  selector: 'app-prompt-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PromptLabel],
  host: { class: 'flex flex-wrap items-center gap-x-2' },
  template: `
    <app-prompt-label [path]="path()" />
    <input
      #field
      class="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-[16px] text-ink caret-primary outline-none sm:text-[15px]"
      type="text"
      autocomplete="off"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      aria-label="Digite um comando"
      [value]="value()"
      (input)="value.set(field.value)"
      (keydown)="onKeydown($event)"
    />
  `,
})
export class PromptInput {
  private readonly session = inject(TerminalSession);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  readonly path = input('~');

  protected readonly value = signal('');
  /** Posição atual ao navegar no histórico (`null` = editando a linha nova). */
  private historyIndex: number | null = null;
  private draft = '';

  focus(): void {
    this.field().nativeElement.focus({ preventScroll: true });
  }

  protected onKeydown(event: KeyboardEvent): void {
    const key = event.key;

    if (key === 'Enter') {
      event.preventDefault();
      this.submit();
    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
      event.preventDefault();
      this.navigateHistory(key === 'ArrowUp' ? -1 : 1);
    } else if (key === 'Tab') {
      event.preventDefault();
      this.complete();
    } else if (event.ctrlKey && key.toLowerCase() === 'l') {
      event.preventDefault();
      this.session.clear();
    } else if (event.ctrlKey && key.toLowerCase() === 'c' && !this.hasSelection()) {
      event.preventDefault();
      this.session.cancel(this.value());
      this.reset();
    }
  }

  private submit(): void {
    const line = this.value();
    this.reset();
    void this.session.execute(line);
  }

  private complete(): void {
    const current = this.value();
    const result = this.session.complete(current);
    if (result.options.length > 1) this.session.showCompletions(current, result.options);
    this.setValue(result.line);
  }

  private navigateHistory(direction: -1 | 1): void {
    const history = this.session.history();
    if (history.length === 0) return;

    if (this.historyIndex === null) {
      if (direction === 1) return;
      this.draft = this.value();
      this.historyIndex = history.length;
    }

    const next = this.historyIndex + direction;
    if (next < 0) return;

    if (next >= history.length) {
      this.historyIndex = null;
      this.setValue(this.draft);
    } else {
      this.historyIndex = next;
      this.setValue(history[next]);
    }
  }

  /** Atualiza o valor e coloca o cursor no fim da linha. */
  private setValue(value: string): void {
    this.value.set(value);
    const el = this.field().nativeElement;
    el.value = value;
    el.setSelectionRange(value.length, value.length);
  }

  private reset(): void {
    this.historyIndex = null;
    this.draft = '';
    this.setValue('');
  }

  private hasSelection(): boolean {
    const el = this.field().nativeElement;
    return el.selectionStart !== el.selectionEnd;
  }
}
