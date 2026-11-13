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

  it('tem o botão para voltar ao terminal', async () => {
    const el = await render();
    expect(el.querySelector('app-view-toggle button')).not.toBeNull();
  });
});
