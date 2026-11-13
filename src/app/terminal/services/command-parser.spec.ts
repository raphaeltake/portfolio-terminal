import { parseCommandLine, tokenize } from './command-parser';

describe('command-parser', () => {
  it('separa por espaços', () => {
    expect(tokenize('ls  -la   ~/projetos')).toEqual(['ls', '-la', '~/projetos']);
  });

  it('respeita aspas e escapes', () => {
    expect(tokenize(`echo "olá mundo" 'a b' c\\ d`)).toEqual(['echo', 'olá mundo', 'a b', 'c d']);
  });

  it('mantém argumento vazio entre aspas', () => {
    expect(tokenize('echo ""')).toEqual(['echo', '']);
  });

  it('normaliza o nome do comando para minúsculas', () => {
    expect(parseCommandLine('HELP cd')).toEqual({ name: 'help', args: ['cd'], raw: 'HELP cd' });
  });

  it('retorna null para linha vazia', () => {
    expect(parseCommandLine('   ')).toBeNull();
  });
});
