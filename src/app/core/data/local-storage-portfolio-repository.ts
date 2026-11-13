import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SEED_DATA_URL, STORAGE_KEYS } from '../config/terminal.config';
import { PortfolioData } from '../models/portfolio.model';
import { normalizePortfolioData } from './portfolio-normalizer';
import { PortfolioRepository } from './portfolio-repository';

/**
 * Persistência sem backend:
 * - leitura: edições do localStorage; se não houver, `public/data/portfolio.json`;
 * - escrita: localStorage do navegador atual.
 *
 * Para publicar as edições para todos os visitantes, exporte o JSON no painel
 * (aba "dados") e substitua `public/data/portfolio.json`.
 */
@Injectable()
export class LocalStoragePortfolioRepository extends PortfolioRepository {
  private readonly http = inject(HttpClient);

  async load(): Promise<PortfolioData> {
    const stored = this.readStorage();
    if (stored) {
      try {
        return normalizePortfolioData(JSON.parse(stored));
      } catch {
        // Dados corrompidos: ignora e cai no seed.
      }
    }
    return this.loadSeed();
  }

  async save(data: PortfolioData): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.portfolio, JSON.stringify(data));
    } catch (error) {
      const quota = error instanceof DOMException && error.name === 'QuotaExceededError';
      throw new Error(
        quota
          ? 'Espaço do navegador esgotado. Use imagens menores ou URLs externas.'
          : 'Não foi possível salvar no armazenamento do navegador.',
      );
    }
  }

  async reset(): Promise<PortfolioData> {
    try {
      localStorage.removeItem(STORAGE_KEYS.portfolio);
    } catch {
      // Armazenamento indisponível: nada a limpar.
    }
    return this.loadSeed();
  }

  private async loadSeed(): Promise<PortfolioData> {
    const seed = await firstValueFrom(this.http.get<unknown>(SEED_DATA_URL));
    return normalizePortfolioData(seed);
  }

  private readStorage(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEYS.portfolio);
    } catch {
      return null;
    }
  }
}
