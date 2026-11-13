import { Signal } from '@angular/core';

export type LoginResult =
  { ok: true } | { ok: false; reason: 'invalid' | 'locked' | 'unavailable'; message: string };

/**
 * Contrato de autenticação do painel administrativo.
 *
 * Implementação padrão: `LocalAuthService` (registrada em `app.config.ts`).
 * Para um backend real, crie outra implementação e troque o provider.
 */
export abstract class AuthService {
  abstract readonly isAuthenticated: Signal<boolean>;
  abstract readonly username: Signal<string | null>;

  abstract login(username: string, password: string): Promise<LoginResult>;
  abstract logout(): void;

  /** Revalida a sessão (ex.: expiração). Retorna se continua autenticado. */
  abstract checkSession(): boolean;
}
