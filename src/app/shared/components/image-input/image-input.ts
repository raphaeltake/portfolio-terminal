import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { imageFileToDataUrl } from '../../../core/utils/browser.utils';

/**
 * Campo de imagem compatível com Reactive Forms (`formControlName`).
 * Aceita uma URL digitada ou o upload de um arquivo, que é redimensionado e
 * guardado como data URL.
 */
@Component({
  selector: 'app-image-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ImageInput), multi: true },
  ],
  host: { class: 'block' },
  template: `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
      <div
        class="flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded border border-line bg-elevated text-xs text-muted sm:w-40"
      >
        @if (value() && !previewFailed()) {
          <img
            class="size-full object-cover"
            [src]="value()"
            alt="Pré-visualização"
            (error)="previewFailed.set(true)"
          />
        } @else {
          [ sem imagem ]
        }
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        @if (isUpload()) {
          <p class="text-sm text-muted">Imagem enviada ({{ uploadSizeKb() }} KB).</p>
        } @else {
          <input
            class="input"
            type="text"
            [placeholder]="placeholder()"
            [value]="value()"
            [disabled]="disabled()"
            (input)="setValue($any($event.target).value)"
            (blur)="onTouched()"
          />
        }
        <div class="flex flex-wrap gap-2">
          <label class="btn btn-sm" [class.pointer-events-none]="disabled() || loading()">
            {{ loading() ? 'processando...' : '⇪ enviar arquivo' }}
            <input
              class="sr-only"
              type="file"
              accept="image/*"
              [disabled]="disabled()"
              (change)="onFile($event)"
            />
          </label>
          @if (value()) {
            <button type="button" class="btn btn-sm" [disabled]="disabled()" (click)="setValue('')">
              remover
            </button>
          }
        </div>
        @if (error()) {
          <span class="field-error">{{ error() }}</span>
        }
      </div>
    </div>
  `,
})
export class ImageInput implements ControlValueAccessor {
  /** Largura máxima da imagem enviada (px). */
  readonly maxWidth = input(1200);
  readonly placeholder = input('https://... ou images/projects/foto.png');

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly previewFailed = signal(false);

  protected readonly isUpload = computed(() => this.value().startsWith('data:'));
  protected readonly uploadSizeKb = computed(() =>
    Math.round((this.value().length * 3) / 4 / 1024),
  );

  private onChange: (value: string) => void = () => {};
  protected onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    this.previewFailed.set(false);
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  protected setValue(value: string): void {
    this.value.set(value);
    this.previewFailed.set(false);
    this.error.set(null);
    this.onChange(value);
  }

  protected async onFile(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;

    this.loading.set(true);
    try {
      this.setValue(await imageFileToDataUrl(file, this.maxWidth()));
      this.onTouched();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'Falha ao processar imagem.');
    } finally {
      this.loading.set(false);
    }
  }
}
