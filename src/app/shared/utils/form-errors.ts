import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Aceita vazio ou uma URL http(s). Combine com `Validators.required` se necessário. */
export const urlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
};

/**
 * URL de imagem: http(s), caminho relativo (ex.: `images/foto.png`) ou data URL
 * de imagem gerada pelo upload.
 */
export const imageSourceValidator: ValidatorFn = (control) => {
  const value = String(control.value ?? '').trim();
  if (!value || value.startsWith('data:image/') || !/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    return null;
  }
  return urlValidator(control);
};

const MESSAGES: Record<string, (error: unknown) => string> = {
  required: () => 'Campo obrigatório.',
  email: () => 'E-mail inválido.',
  url: () => 'Informe uma URL começando com http:// ou https://.',
  pattern: () => 'Formato inválido.',
  maxlength: (e) => `Máximo de ${(e as { requiredLength: number }).requiredLength} caracteres.`,
  slugTaken: () => 'Já existe um projeto com esse nome.',
};

/** Mensagem do primeiro erro do controle, apenas depois que ele foi tocado. */
export function errorOf(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const [key, value] = Object.entries(control.errors)[0];
  return MESSAGES[key]?.(value) ?? 'Valor inválido.';
}
