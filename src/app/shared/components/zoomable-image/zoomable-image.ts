import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';

/**
 * Miniatura que abre a imagem ampliada em um `<dialog>` nativo ao ser clicada
 * (Esc, clique ou o botão "fechar" fecham). Usada nos certificados, que têm texto
 * pequeno demais para ler na miniatura. Se a imagem falhar, nada é exibido.
 */
@Component({
  selector: 'app-zoomable-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @if (visible()) {
      <button
        type="button"
        class="block w-full cursor-zoom-in overflow-hidden rounded border border-line bg-elevated transition-colors hover:border-primary"
        [attr.aria-label]="'Ampliar imagem: ' + alt()"
        (click)="open()"
      >
        <img
          class="aspect-[3/2] w-full object-contain"
          [src]="src()"
          [alt]="alt()"
          loading="lazy"
          (error)="failedSrc.set(src())"
        />
      </button>

      <dialog
        #dialog
        class="m-auto max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-base/90"
        [attr.aria-label]="alt()"
        (click)="close()"
      >
        <figure class="flex flex-col items-center gap-3 p-2">
          <img
            class="h-auto max-h-[85dvh] w-[min(94vw,1000px)] rounded border border-line-strong object-contain"
            [src]="src()"
            [alt]="alt()"
          />
          <figcaption class="flex items-center gap-3 text-sm text-muted">
            {{ alt() }}
            <button type="button" class="btn btn-sm" (click)="close()">fechar</button>
          </figcaption>
        </figure>
      </dialog>
    }
  `,
})
export class ZoomableImage {
  readonly src = input.required<string>();
  readonly alt = input.required<string>();

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');
  /** Guarda a URL que falhou para esconder a imagem sem "piscar". */
  protected readonly failedSrc = signal<string | null>(null);
  protected readonly visible = computed(() => !!this.src() && this.src() !== this.failedSrc());

  protected open(): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) return;
    // jsdom e navegadores antigos podem não ter showModal().
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  protected close(): void {
    const dialog = this.dialog()?.nativeElement;
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
}
