/**
 * Credenciais do painel administrativo (acessado pelo comando oculto
 * `edit-infos-minhas`).
 *
 * ⚠️ A senha NÃO fica em texto puro: guardamos apenas sha256(`${salt}:${senha}`).
 * Para trocar a senha, rode `npm run hash-password -- "nova-senha"` e cole
 * os valores gerados abaixo.
 *
 * Importante: sem backend, esta autenticação acontece no navegador. Ela
 * esconde o painel de visitantes, mas não é uma barreira de segurança real.
 * Veja CLAUDE.md > "Persistência e autenticação".
 */
export const ADMIN_CONFIG = {
  username: 'admin',
  salt: '56d7a60f54eb1ae7db40a0549a89b1a7',
  passwordHash: '47cc6ba9ff514411759ef40bd38c3816b96171bba69a83d0e17e75248412899c',
  /** Duração da sessão após o login. */
  sessionDurationMs: 2 * 60 * 60 * 1000,
  /** Tentativas erradas antes de bloquear o formulário temporariamente. */
  maxAttempts: 5,
  lockDurationMs: 30 * 1000,
} as const;
