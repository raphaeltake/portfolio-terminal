import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

/** Visualizações públicas do portfólio. */
export type PortfolioView = 'terminal' | 'gui';

/** Rota de cada visualização (ver `app.routes.ts`). */
export const VIEW_ROUTES: Record<PortfolioView, string> = {
  terminal: '/',
  gui: '/gui',
};

/** Atalho exibido nos rótulos (o teste de tecla fica em `isViewShortcut`). */
export const VIEW_SHORTCUT_LABEL = 'ctrl+f1';

/**
 * Alterna entre o terminal e a interface gráfica (botão ou Ctrl+F1).
 * Em rotas fora do portfólio (`/login`, `/admin`) a alternância não faz nada,
 * para não tirar o admin de um formulário no meio da edição.
 */
@Injectable({ providedIn: 'root' })
export class ViewSwitcher {
  private readonly router = inject(Router);

  /** Visualização da rota atual; `null` fora do portfólio. */
  readonly current = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => viewOf(this.router.url)),
    ),
    { initialValue: viewOf(this.router.url) },
  );

  /** Vai para a outra visualização. Resolve `false` se a rota atual não é do portfólio. */
  toggle(): Promise<boolean> {
    const view = viewOf(this.router.url);
    if (!view) return Promise.resolve(false);
    return this.router.navigateByUrl(VIEW_ROUTES[view === 'terminal' ? 'gui' : 'terminal']);
  }

  /** Trata o atalho global. Retorna `true` se o evento foi consumido. */
  handleKeydown(event: KeyboardEvent): boolean {
    if (!isViewShortcut(event) || !viewOf(this.router.url)) return false;
    event.preventDefault();
    if (!event.repeat) void this.toggle();
    return true;
  }
}

/** Ctrl+F1, sem outros modificadores. */
export function isViewShortcut(event: KeyboardEvent): boolean {
  return event.key === 'F1' && event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey;
}

/** Identifica a visualização pela URL (ignorando query string e fragmento). */
export function viewOf(url: string): PortfolioView | null {
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '');
  if (path === '') return 'terminal';
  if (path === VIEW_ROUTES.gui) return 'gui';
  return null;
}
