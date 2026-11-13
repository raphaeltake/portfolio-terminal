import { PortfolioData } from '../models/portfolio.model';

/**
 * Contrato de persistência dos dados do portfólio.
 *
 * A implementação padrão é `LocalStoragePortfolioRepository` (registrada em
 * `app.config.ts`). Para usar um backend real (API própria, Firebase,
 * Supabase...), crie outra classe que estenda esta e troque o provider —
 * nenhum componente precisa mudar.
 */
export abstract class PortfolioRepository {
  /** Carrega os dados atuais (edições salvas ou, na falta delas, o seed). */
  abstract load(): Promise<PortfolioData>;

  /** Persiste o documento completo. */
  abstract save(data: PortfolioData): Promise<void>;

  /** Descarta as edições e volta aos dados iniciais (seed). */
  abstract reset(): Promise<PortfolioData>;
}
