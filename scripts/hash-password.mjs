#!/usr/bin/env node
/**
 * Gera salt + hash SHA-256 para a senha do painel administrativo.
 *
 * Uso:  npm run hash-password -- "minha-senha-forte"
 *
 * Copie os valores impressos para src/app/core/config/admin.config.ts.
 * O hash é calculado como: sha256(`${salt}:${senha}`) em hexadecimal,
 * o mesmo algoritmo usado por LocalAuthService no navegador.
 */
import { createHash, randomBytes } from 'node:crypto';

const password = process.argv[2];

if (!password) {
  console.error('Uso: npm run hash-password -- "sua-senha"');
  process.exit(1);
}

if (password.length < 8) {
  console.warn('Aviso: use uma senha com pelo menos 8 caracteres.');
}

const salt = randomBytes(16).toString('hex');
const passwordHash = createHash('sha256').update(`${salt}:${password}`).digest('hex');

console.log(`\nCole em src/app/core/config/admin.config.ts:\n`);
console.log(`  salt: '${salt}',`);
console.log(`  passwordHash: '${passwordHash}',\n`);
