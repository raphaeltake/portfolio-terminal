import {
  Certificate,
  Education,
  Experience,
  PORTFOLIO_DATA_VERSION,
  PortfolioData,
  Profile,
  Project,
  SocialLink,
} from '../models/portfolio.model';
import { createId, slugify } from '../utils/text.utils';

type Loose = Record<string, unknown>;

const str = (value: unknown): string => (typeof value === 'string' ? value : '');
const obj = (value: unknown): Loose =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Loose) : {};
const arr = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

export const EMPTY_PROFILE: Profile = {
  name: '',
  role: '',
  location: '',
  email: '',
  bio: '',
  avatarUrl: '',
  resumeUrl: '',
  skills: [],
  links: [],
  experiences: [],
  education: [],
  certificates: [],
};

export const EMPTY_PORTFOLIO: PortfolioData = {
  version: PORTFOLIO_DATA_VERSION,
  profile: EMPTY_PROFILE,
  projects: [],
};

/**
 * Garante que dados vindos de fontes externas (JSON importado, localStorage,
 * seed) tenham o formato esperado, preenchendo campos ausentes.
 * Lança erro se o documento não parecer um portfólio.
 */
export function normalizePortfolioData(input: unknown): PortfolioData {
  const raw = obj(input);
  if (!('profile' in raw) && !('projects' in raw)) {
    throw new Error('JSON inválido: esperado um objeto com "profile" e "projects".');
  }

  const projects: Project[] = [];
  const usedSlugs = new Set<string>();
  for (const item of arr(raw['projects'])) {
    const project = normalizeProject(item);
    let slug = project.slug;
    for (let n = 2; usedSlugs.has(slug); n++) slug = `${project.slug}-${n}`;
    usedSlugs.add(slug);
    projects.push({ ...project, slug });
  }

  return {
    version: PORTFOLIO_DATA_VERSION,
    profile: normalizeProfile(raw['profile']),
    projects,
  };
}

export function normalizeProfile(input: unknown): Profile {
  const raw = obj(input);
  return {
    name: str(raw['name']),
    role: str(raw['role']),
    location: str(raw['location']),
    email: str(raw['email']),
    bio: str(raw['bio']),
    avatarUrl: str(raw['avatarUrl']),
    resumeUrl: str(raw['resumeUrl']),
    skills: arr(raw['skills']).map(str).filter(Boolean),
    links: arr(raw['links'])
      .map(normalizeLink)
      .filter((link) => link.url),
    experiences: arr(raw['experiences']).map(normalizeExperience),
    education: arr(raw['education']).map(normalizeEducation),
    // Dados salvos antes dos certificados existirem não têm o campo: vira lista vazia.
    certificates: arr(raw['certificates'])
      .map(normalizeCertificate)
      .filter((item) => item.name),
  };
}

export function normalizeProject(input: unknown): Project {
  const raw = obj(input);
  const title = str(raw['title']) || 'Projeto sem título';
  return {
    id: str(raw['id']) || createId(),
    slug: slugify(str(raw['slug']) || title) || 'projeto',
    title,
    description: str(raw['description']),
    imageUrl: str(raw['imageUrl']),
    link: str(raw['link']),
    repoUrl: str(raw['repoUrl']),
    tags: arr(raw['tags']).map(str).filter(Boolean),
  };
}

function normalizeLink(input: unknown): SocialLink {
  const raw = obj(input);
  return { label: str(raw['label']), url: str(raw['url']) };
}

function normalizeExperience(input: unknown): Experience {
  const raw = obj(input);
  return {
    role: str(raw['role']),
    company: str(raw['company']),
    period: str(raw['period']),
    description: str(raw['description']),
  };
}

function normalizeEducation(input: unknown): Education {
  const raw = obj(input);
  return {
    course: str(raw['course']),
    institution: str(raw['institution']),
    period: str(raw['period']),
  };
}

function normalizeCertificate(input: unknown): Certificate {
  const raw = obj(input);
  return {
    name: str(raw['name']),
    issuer: str(raw['issuer']),
    date: str(raw['date']),
    url: str(raw['url']),
    imageUrl: str(raw['imageUrl']),
  };
}
