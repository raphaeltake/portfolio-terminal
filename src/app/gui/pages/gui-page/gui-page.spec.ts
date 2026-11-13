import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { InMemoryPortfolioRepository } from '../../../../testing/portfolio-fixtures';
import { PortfolioRepository } from '../../../core/data/portfolio-repository';
import { PortfolioStore } from '../../../core/state/portfolio-store';
import { GuiPage } from './gui-page';

describe('GuiPage', () => {
  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(GuiPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [GuiPage],
      providers: [
        provideRouter([]),
        { provide: PortfolioRepository, useClass: InMemoryPortfolioRepository },
      ],
    });
    await TestBed.inject(PortfolioStore).load();
  });

  it('mostra perfil, projetos e contato do store', async () => {
    const el = await render();
    const text = el.textContent ?? '';

    expect(el.querySelector('h1')?.textContent).toContain('Ada Lovelace');
    expect(text).toContain('Engenheira de Software');
    expect(el.querySelectorAll('app-project-card')).toHaveLength(2);
    expect(text).toContain('Máquina Analítica');
    expect(el.querySelector('a[href="mailto:ada@exemplo.com"]')).not.toBeNull();
  });

  it('esconde seções vazias da navegação', async () => {
    const el = await render();
    const nav = el.querySelector('nav')?.textContent ?? '';

    // O fixture não tem experiência nem formação.
    expect(nav).not.toContain('carreira');
    expect(el.querySelector('#carreira')).toBeNull();
    expect(nav).toContain('projetos');
    expect(nav).toContain('contato');
  });

  it('mostra a seção de certificados com o link da credencial', async () => {
    const el = await render();
    const section = el.querySelector('#certificados');

    expect(el.querySelector('nav')?.textContent).toContain('certificados');
    expect(section?.textContent).toContain('Cálculo de Diferenças');
    expect(section?.textContent).toContain('Royal Society');
    expect(section?.querySelector('a[href="https://exemplo.com/certificado"]')).not.toBeNull();
    expect(section?.querySelector('app-zoomable-image img')?.getAttribute('src')).toBe(
      'images/certificado.png',
    );
  });

  it('não mostra imagem em certificado sem imagem', async () => {
    const store = TestBed.inject(PortfolioStore);
    const [certificate] = store.profile().certificates;
    await store.updateProfile({
      ...store.profile(),
      certificates: [{ ...certificate, imageUrl: '' }],
    });
    const el = await render();

    expect(el.querySelector('#certificados')?.textContent).toContain('Cálculo de Diferenças');
    expect(el.querySelector('#certificados app-zoomable-image')).toBeNull();
  });

  it('esconde a seção de certificados quando não há nenhum', async () => {
    const store = TestBed.inject(PortfolioStore);
    await store.updateProfile({ ...store.profile(), certificates: [] });
    const el = await render();

    expect(el.querySelector('#certificados')).toBeNull();
    expect(el.querySelector('nav')?.textContent).not.toContain('certificados');
  });

  it('tem o botão para voltar ao terminal', async () => {
    const el = await render();
    expect(el.querySelector('app-view-toggle button')).not.toBeNull();
  });
});
