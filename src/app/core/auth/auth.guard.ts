import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from './auth.service';

/** Protege rotas administrativas: sem sessão válida, redireciona ao login. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.checkSession()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

/** Evita mostrar o login para quem já está autenticado. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.checkSession() ? inject(Router).createUrlTree(['/admin']) : true;
};
