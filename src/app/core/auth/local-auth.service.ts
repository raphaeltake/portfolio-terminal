import { Injectable, computed, signal } from '@angular/core';

import { ADMIN_CONFIG } from '../config/admin.config';
import { STORAGE_KEYS } from '../config/terminal.config';
import { sha256Hex } from '../utils/browser.utils';
import { AuthService, LoginResult } from './auth.service';

interface StoredSession {
  username: string;
  expiresAt: number;
}

/**
 * Autenticação feita no navegador: compara sha256(salt:senha) com o hash de
 * `ADMIN_CONFIG` e guarda a sessão no sessionStorage (some ao fechar a aba).
 */
@Injectable()
export class LocalAuthService extends AuthService {
  private readonly session = signal<StoredSession | null>(this.readSession());
  private failedAttempts = 0;
  private lockedUntil = 0;

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly username = computed(() => this.session()?.username ?? null);

  async login(username: string, password: string): Promise<LoginResult> {
    const now = Date.now();
    if (now < this.lockedUntil) {
      const seconds = Math.ceil((this.lockedUntil - now) / 1000);
      return { ok: false, reason: 'locked', message: `Muitas tentativas. Aguarde ${seconds}s.` };
    }

    let hash: string;
    try {
      hash = await sha256Hex(`${ADMIN_CONFIG.salt}:${password}`);
    } catch (error) {
      return { ok: false, reason: 'unavailable', message: (error as Error).message };
    }

    if (username.trim() !== ADMIN_CONFIG.username || hash !== ADMIN_CONFIG.passwordHash) {
      this.failedAttempts++;
      if (this.failedAttempts >= ADMIN_CONFIG.maxAttempts) {
        this.failedAttempts = 0;
        this.lockedUntil = now + ADMIN_CONFIG.lockDurationMs;
      }
      return { ok: false, reason: 'invalid', message: 'Login incorreto.' };
    }

    this.failedAttempts = 0;
    const session: StoredSession = {
      username: ADMIN_CONFIG.username,
      expiresAt: now + ADMIN_CONFIG.sessionDurationMs,
    };
    this.writeSession(session);
    this.session.set(session);
    return { ok: true };
  }

  logout(): void {
    this.writeSession(null);
    this.session.set(null);
  }

  checkSession(): boolean {
    const current = this.session();
    if (current && current.expiresAt <= Date.now()) {
      this.logout();
      return false;
    }
    return current !== null;
  }

  private readSession(): StoredSession | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.session);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredSession;
      return parsed.expiresAt > Date.now() ? parsed : null;
    } catch {
      return null;
    }
  }

  private writeSession(session: StoredSession | null): void {
    try {
      if (session) sessionStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
      else sessionStorage.removeItem(STORAGE_KEYS.session);
    } catch {
      // sessionStorage indisponível (ex.: modo privado restrito): sessão só em memória.
    }
  }
}
