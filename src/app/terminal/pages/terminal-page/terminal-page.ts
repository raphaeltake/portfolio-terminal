import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';

import { TERMINAL_CONFIG } from '../../../core/config/terminal.config';
import { TerminalWindow } from '../../../shared/components/terminal-window/terminal-window';
import { PromptInput } from '../../components/prompt-input/prompt-input';
import { TerminalOutput } from '../../components/terminal-output/terminal-output';
import { TerminalSession } from '../../services/terminal-session';
import { VirtualFileSystem } from '../../services/virtual-file-system';

/** Página principal: o terminal interativo. */
@Component({
  selector: 'app-terminal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TerminalWindow, TerminalOutput, PromptInput],
  templateUrl: './terminal-page.html',
})
export class TerminalPage {
  protected readonly session = inject(TerminalSession);
  protected readonly fs = inject(VirtualFileSystem);

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly prompt = viewChild.required(PromptInput);

  protected readonly title = computed(
    () => `${TERMINAL_CONFIG.user}@${TERMINAL_CONFIG.host}: ${this.fs.displayCwd()}`,
  );

  /** Mantém a rolagem no fim enquanto o usuário não subir para ler algo. */
  private stickToBottom = true;
  /** Última posição definida pelo código (para ignorar o evento de scroll que ela gera). */
  private programmaticTop = -1;

  constructor() {
    this.session.start();

    // Toda nova entrada volta a "grudar" a rolagem no fim.
    effect(() => {
      this.session.entries();
      this.stickToBottom = true;
    });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Observa mudanças de altura (novas saídas, imagens carregando...).
      const observer = new ResizeObserver(() => {
        if (this.stickToBottom) this.scrollToBottom();
      });
      observer.observe(this.content().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
      this.prompt().focus();
    });
  }

  protected run(command: string): void {
    void this.session.execute(command);
    this.prompt().focus();
  }

  protected onScroll(): void {
    const el = this.scroller().nativeElement;
    // O evento de scroll é assíncrono: o gerado por scrollToBottom() pode chegar depois de
    // uma nova saída já ter aumentado a altura. Só rolagens do usuário mudam o "grude".
    if (el.scrollTop === this.programmaticTop) return;
    this.stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
  }

  /** Clicar em qualquer área vazia do terminal foca o prompt (sem atrapalhar seleção de texto). */
  protected focusPrompt(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('a, button, input, textarea, select')) return;
    if (window.getSelection()?.toString()) return;
    this.prompt().focus();
  }

  private scrollToBottom(): void {
    const el = this.scroller().nativeElement;
    el.scrollTop = el.scrollHeight;
    this.programmaticTop = el.scrollTop;
  }
}
