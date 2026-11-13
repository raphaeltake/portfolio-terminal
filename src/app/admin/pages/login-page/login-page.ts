import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/auth/auth.service';
import { FeedbackMessage } from '../../../shared/components/feedback-message/feedback-message';
import { FormField } from '../../../shared/components/form-field/form-field';
import { TerminalWindow } from '../../../shared/components/terminal-window/terminal-window';
import { Autofocus } from '../../../shared/directives/autofocus';
import { Feedback } from '../../../shared/utils/feedback';
import { errorOf } from '../../../shared/utils/form-errors';

/** Login do painel administrativo (acessado via comando oculto `edit-infos-minhas`). */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, TerminalWindow, FormField, FeedbackMessage, Autofocus],
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Rota de retorno após o login (query param `?redirect=`). */
  readonly redirect = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  protected readonly loading = signal(false);
  protected readonly feedback = new Feedback();
  protected readonly errorOf = errorOf;

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { username, password } = this.form.getRawValue();
    const result = await this.auth.login(username, password);
    this.loading.set(false);

    if (!result.ok) {
      this.feedback.error(result.message);
      this.form.controls.password.reset();
      return;
    }

    await this.router.navigateByUrl(this.safeRedirect());
  }

  /** Só aceita caminhos internos, evitando redirecionamento para outro site. */
  private safeRedirect(): string {
    const target = this.redirect();
    return target && target.startsWith('/') && !target.startsWith('//') ? target : '/admin';
  }
}
