import { normalizePortfolioData } from './portfolio-normalizer';

describe('normalizePortfolioData', () => {
  it('rejeita documentos que não parecem um portfólio', () => {
    expect(() => normalizePortfolioData({ foo: 1 })).toThrow();
    expect(() => normalizePortfolioData(null)).toThrow();
  });

  it('preenche campos ausentes e gera slug a partir do título', () => {
    const data = normalizePortfolioData({ projects: [{ title: 'Meu Projeto Ágil!' }] });
    expect(data.profile.skills).toEqual([]);
    expect(data.projects[0].slug).toBe('meu-projeto-agil');
    expect(data.projects[0].id).toBeTruthy();
    expect(data.projects[0].tags).toEqual([]);
  });

  it('evita slugs duplicados', () => {
    const data = normalizePortfolioData({
      projects: [{ title: 'App' }, { title: 'App' }, { slug: 'app' }],
    });
    expect(data.projects.map((p) => p.slug)).toEqual(['app', 'app-2', 'app-3']);
  });
});
