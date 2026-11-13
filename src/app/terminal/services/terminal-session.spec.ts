import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { InMemoryPortfolioRepository } from '../../../testing/portfolio-fixtures';
import { PortfolioRepository } from '../../core/data/portfolio-repository';
import type { OutputBlock } from '../../core/models/terminal.model';
import { PortfolioStore } from '../../core/state/portfolio-store';
import { TerminalSession } from './terminal-session';
import { VirtualFileSystem } from './virtual-file-system';

describe('TerminalSession', () => {
  let session: TerminalSession;
  let fs: VirtualFileSystem;
  let store: PortfolioStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PortfolioRepository, useClass: InMemoryPortfolioRepository },
      ],
    });
    store = TestBed.inject(PortfolioStore);
    await store.load();
    session = TestBed.inject(TerminalSession);
    fs = TestBed.inject(VirtualFileSystem);
  });

  /** Executa e devolve a saída da última entrada. */
  async function run(line: string): Promise<OutputBlock[]> {
    await session.execute(line);
    return session.entries().at(-1)?.output ?? [];
  }

  function texts(output: OutputBlock[]): string {
    return JSON.stringify(output);
  }

  it('help lista comandos públicos e esconde os ocultos', async () => {
    const output = await run('help');
    expect(texts(output)).toContain('visualizar-projeto');
    expect(texts(output)).not.toContain('edit-infos-minhas');
    expect(texts(output)).not.toContain('sudo');
  });

  it('help não revela comandos ocultos pelo nome', async () => {
    const output = await run('help edit-infos-minhas');
    expect(output[0]).toMatchObject({ type: 'text', tone: 'error' });
  });

  it('ls lista a home e cd entra em projetos', async () => {
    const home = await run('ls');
    expect(texts(home)).toContain('projetos/');
    expect(texts(home)).toContain('curriculo.txt');

    await run('cd projetos');
    expect(fs.displayCwd()).toBe('~/projetos');

    const projects = await run('ls');
    expect(texts(projects)).toContain('maquina-analitica');

    await run('cd ..');
    expect(fs.displayCwd()).toBe('~');
    await run('cd /');
    expect(fs.displayCwd()).toBe('/');
    await run('cd');
    expect(fs.displayCwd()).toBe('~');
  });

  it('cd informa erros', async () => {
    expect(texts(await run('cd nada'))).toContain('inexistente');
    expect(texts(await run('cd sobre.txt'))).toContain('Não é um diretório');
  });

  it('visualizar-projeto mostra imagem, título, descrição e link', async () => {
    const [block] = await run('visualizar-projeto maquina-analitica');
    expect(block.type).toBe('project');
    if (block.type === 'project') {
      expect(block.project).toMatchObject({
        title: 'Máquina Analítica',
        description: 'Um computador mecânico.',
        imageUrl: 'images/maquina.png',
        link: 'https://exemplo.com/maquina',
      });
    }
  });

  it('visualizar-projeto aceita caminho e sugere nomes parecidos', async () => {
    expect((await run('visualizar-projeto ~/projetos/notas'))[0].type).toBe('project');
    const output = await run('visualizar-projeto maquina-analitca');
    expect(texts(output)).toContain('Você quis dizer');
  });

  it('cat abre arquivos e projetos', async () => {
    expect((await run('cat curriculo.txt'))[0].type).toBe('resume');
    expect((await run('cat projetos/notas'))[0].type).toBe('project');
    expect(texts(await run('cat projetos'))).toContain('É um diretório');
  });

  it('certificados lista os certificados do perfil (comando, apelido e arquivo)', async () => {
    for (const line of ['certificados', 'certs', 'cat certificados.txt']) {
      const [block] = await run(line);
      expect(block.type).toBe('certificates');
      if (block.type === 'certificates') {
        expect(block.certificates[0]).toMatchObject({
          name: 'Cálculo de Diferenças',
          imageUrl: 'images/certificado.png',
        });
      }
    }
    expect(texts(await run('ls'))).toContain('certificados.txt');
  });

  it('certificados avisa quando não há nenhum', async () => {
    await store.updateProfile({ ...store.profile(), certificates: [] });
    const output = await run('certificados');
    expect(output[0]).toMatchObject({ type: 'text', tone: 'muted' });
  });

  it('projetos criados no store aparecem no sistema de arquivos', async () => {
    await store.saveProject({
      id: 'novo',
      slug: 'novo-projeto',
      title: 'Novo',
      description: '',
      imageUrl: '',
      link: '',
      repoUrl: '',
      tags: [],
    });
    expect(texts(await run('ls ~/projetos'))).toContain('novo-projeto');
  });

  it('comando desconhecido sugere o mais próximo', async () => {
    const output = await run('curiculo');
    expect(texts(output)).toContain('comando não encontrado');
    expect(texts(output)).toContain('"curriculo"');
  });

  it('clear limpa a tela', async () => {
    await run('help');
    await session.execute('clear');
    expect(session.entries()).toEqual([]);
  });

  it('guarda o histórico de comandos', async () => {
    await run('ls');
    await run('pwd');
    await run('pwd');
    expect(session.history()).toEqual(['ls', 'pwd']);
  });

  it('autocompleta comandos e caminhos', () => {
    expect(session.complete('visu').line).toBe('visualizar-projeto ');
    expect(session.complete('cd pro').line).toBe('cd projetos/');
    expect(session.complete('visualizar-projeto no').line).toBe('visualizar-projeto notas ');
    expect(session.complete('c').options).toEqual(
      expect.arrayContaining(['cd', 'cat', 'curriculo']),
    );
    expect(session.complete('edit').options).toEqual([]);
    expect(session.complete('edit').line).toBe('edit');
  });

  it('edit-infos-minhas redireciona para o login', async () => {
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await run('edit-infos-minhas');
    vi.runAllTimers();

    expect(navigate).toHaveBeenCalledWith(['/login']);
    vi.useRealTimers();
  });
});
