import { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Portfolio Terminal',
    loadComponent: () =>
      import('./terminal/pages/terminal-page/terminal-page').then((m) => m.TerminalPage),
  },
  {
    path: 'login',
    title: 'Login · Portfolio Terminal',
    canActivate: [guestGuard],
    loadComponent: () => import('./admin/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    title: 'Painel · Portfolio Terminal',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/pages/admin-page/admin-page').then((m) => m.AdminPage),
  },
  { path: '**', redirectTo: '' },
];
