/** Link externo (GitHub, LinkedIn, site...). */
export interface SocialLink {
  label: string;
  url: string;
}

/** Item de experiência profissional exibido no currículo. */
export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
}

/** Item de formação acadêmica/cursos exibido no currículo. */
export interface Education {
  course: string;
  institution: string;
  period: string;
}

/** Certificado ou curso livre (comando `certificados` e seção da GUI). */
export interface Certificate {
  name: string;
  /** Quem emitiu: Alura, AWS, Coursera... */
  issuer: string;
  /** Data de emissão em texto livre: "2024", "mar/2024". */
  date: string;
  /** Link para validar a credencial (opcional). */
  url: string;
  /** Imagem do certificado: http/https, caminho em /public ou data URL (opcional). */
  imageUrl: string;
}

/** Informações pessoais editáveis pelo painel administrativo. */
export interface Profile {
  name: string;
  role: string;
  location: string;
  email: string;
  bio: string;
  avatarUrl: string;
  /** Link para um PDF do currículo (opcional). */
  resumeUrl: string;
  skills: string[];
  links: SocialLink[];
  experiences: Experience[];
  education: Education[];
  certificates: Certificate[];
}

/** Projeto exibido pelo comando `visualizar-projeto`. */
export interface Project {
  id: string;
  /** Nome usado no terminal: `visualizar-projeto <slug>`. */
  slug: string;
  title: string;
  description: string;
  /** URL da imagem (http/https, caminho em /public ou data URL). */
  imageUrl: string;
  /** Link principal do projeto (deploy, demo...). */
  link: string;
  /** Link do repositório (opcional). */
  repoUrl: string;
  tags: string[];
}

/** Documento completo persistido pelo repositório. */
export interface PortfolioData {
  version: number;
  profile: Profile;
  projects: Project[];
}

export const PORTFOLIO_DATA_VERSION = 1;
