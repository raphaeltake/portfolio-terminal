/** Identidade do terminal exibida no prompt: `visitante@portfolio:~$`. */
export const TERMINAL_CONFIG = {
  user: 'visitante',
  adminUser: 'root',
  host: 'portfolio',
  /** Diretório inicial (home) do sistema de arquivos virtual. */
  home: ['home', 'visitante'] as readonly string[],
  /** Nome do diretório (dentro da home) que lista os projetos. */
  projectsDir: 'projetos',
  /** Quantidade máxima de comandos guardados para navegar com ↑/↓. */
  historyLimit: 100,
} as const;

/** Chaves usadas em localStorage/sessionStorage. */
export const STORAGE_KEYS = {
  portfolio: 'portfolio-terminal:data:v1',
  session: 'portfolio-terminal:session:v1',
} as const;

/** Arquivo com os dados iniciais (seed), servido a partir de `public/`. */
export const SEED_DATA_URL = 'data/portfolio.json';
