import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { routes } from './app.routes';
import { AuthService } from './core/auth/auth.service';
import { LocalAuthService } from './core/auth/local-auth.service';
import { LocalStoragePortfolioRepository } from './core/data/local-storage-portfolio-repository';
import { PortfolioRepository } from './core/data/portfolio-repository';
import { PortfolioStore } from './core/state/portfolio-store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),

    // Troque as implementações abaixo para usar um backend real.
    { provide: PortfolioRepository, useClass: LocalStoragePortfolioRepository },
    { provide: AuthService, useClass: LocalAuthService },

    // Carrega perfil e projetos antes de renderizar a aplicação.
    provideAppInitializer(() => inject(PortfolioStore).load()),
  ],
};
