import { PortfolioRepository } from '../app/core/data/portfolio-repository';
import { PortfolioData } from '../app/core/models/portfolio.model';

export function samplePortfolio(): PortfolioData {
  return {
    version: 1,
    profile: {
      name: 'Ada Lovelace',
      role: 'Engenheira de Software',
      location: 'Londres',
      email: 'ada@exemplo.com',
      bio: 'Primeira programadora.',
      avatarUrl: '',
      resumeUrl: '',
      skills: ['TypeScript'],
      links: [{ label: 'GitHub', url: 'https://github.com/ada' }],
      experiences: [],
      education: [],
      certificates: [
        {
          name: 'Cálculo de Diferenças',
          issuer: 'Royal Society',
          date: '1843',
          url: 'https://exemplo.com/certificado',
          imageUrl: 'images/certificado.png',
        },
      ],
    },
    projects: [
      {
        id: 'p1',
        slug: 'maquina-analitica',
        title: 'Máquina Analítica',
        description: 'Um computador mecânico.',
        imageUrl: 'images/maquina.png',
        link: 'https://exemplo.com/maquina',
        repoUrl: '',
        tags: ['Hardware'],
      },
      {
        id: 'p2',
        slug: 'notas',
        title: 'Notas',
        description: 'Notas sobre a máquina.',
        imageUrl: '',
        link: 'https://exemplo.com/notas',
        repoUrl: '',
        tags: [],
      },
    ],
  };
}

/** Repositório em memória para testes. */
export class InMemoryPortfolioRepository extends PortfolioRepository {
  data = samplePortfolio();

  async load() {
    return structuredClone(this.data);
  }

  async save(data: PortfolioData) {
    this.data = structuredClone(data);
  }

  async reset() {
    this.data = samplePortfolio();
    return structuredClone(this.data);
  }
}
