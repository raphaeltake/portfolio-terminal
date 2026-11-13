# Portfolio Terminal

Portfólio pessoal em formato de **terminal de computador**. O visitante navega digitando
comandos (`help`, `ls`, `cd`, `visualizar-projeto`, `curriculo`...) ou clicando nos itens da
saída. O dono do site edita perfil e projetos por um painel protegido por login, acessado
pelo comando oculto `edit-infos-minhas`.

## Stack

- Angular 21 (standalone, **zoneless**, signals, control flow `@if/@for/@switch`)
- Tailwind CSS 4 (via `@tailwindcss/postcss`, sem `tailwind.config`)
- Reactive Forms no painel
- Vitest (`ng test`) para testes unitários
- Interface e textos em **português (pt-BR)**

## Comandos do projeto

```bash
npm start                              # ng serve em http://localhost:4200
npm run build                          # build de produção em dist/
npm run test:ci                        # testes (vitest) sem watch
npm run hash-password -- "nova-senha"  # gera salt + hash para o login do painel
```

## Estrutura

```
src/
├── styles.css                  # tokens do tema (@theme) + classes reutilizáveis (@layer components)
├── testing/                    # fixtures de teste (repositório em memória)
└── app/
    ├── app.config.ts           # providers: repositório, auth, carregamento inicial
    ├── app.routes.ts           # '' terminal · /login · /admin (protegida)
    ├── core/                   # regras de negócio, sem UI
    │   ├── config/             # terminal.config.ts (prompt, chaves), admin.config.ts (credenciais)
    │   ├── models/             # Profile, Project, PortfolioData, OutputBlock, TerminalEntry
    │   ├── data/               # PortfolioRepository (abstrato) + LocalStorage + normalizador
    │   ├── auth/               # AuthService (abstrato) + LocalAuthService + guards
    │   ├── state/              # PortfolioStore (signals): única fonte de verdade dos dados
    │   └── utils/              # slugify, levenshtein, sha256, imagem → data URL...
    ├── shared/                 # reutilizável em qualquer feature
    │   ├── components/         # terminal-window, project-card, form-field, image-input,
    │   │                       # prompt-label, command-chip, confirm-button, feedback-message
    │   ├── directives/         # autofocus
    │   └── utils/              # Feedback (estado de mensagens), validadores e mensagens de erro
    ├── terminal/               # feature: o terminal
    │   ├── commands/           # um arquivo por grupo; todas as classes estendem Command
    │   ├── services/           # TerminalSession, CommandRegistry, VirtualFileSystem, parser
    │   ├── components/         # terminal-output, output-block, prompt-input, views de saída
    │   ├── output.ts           # fábrica `Out` + conteúdos compartilhados (sobre, contato...)
    │   └── pages/terminal-page
    └── admin/                  # feature: login + painel
        ├── pages/              # login-page, admin-page (abas perfil / projetos / dados)
        └── components/         # profile-form, projects-manager, project-form, data-backup
```

## Tema e estilos

- Tema escuro com **verde claro** como primária. Tokens em `src/styles.css` (`@theme`):
  `base`, `surface`, `elevated`, `line`, `line-strong`, `ink`, `muted`, `primary`,
  `primary-strong`, `primary-dim`, `info`, `warning`, `danger`. Geram utilitários Tailwind
  (`bg-surface`, `text-primary`, `border-line`...). **Não use cores hard-coded.**
- Classes reutilizáveis em `@layer components` — use-as em vez de repetir utilitários:
  `.btn` `.btn-primary` `.btn-danger` `.btn-sm` · `.input` · `.field` `.field-label`
  `.field-hint` `.field-error` · `.panel` `.panel-elevated` · `.tag` · `.chip` · `.tab`
  `.tab-active` · `.link` · `.alert` `.alert-error` `.alert-warning` · `.section-title` ·
  `.glow` · `.ascii-art` · `.tone-*` (cores de texto do terminal) · `.crt-overlay`.
- Componentes não têm arquivos `.css`; estilos ficam em classes globais + utilitários Tailwind.
  Se precisar de `@apply` em CSS de componente, o Tailwind 4 exige `@reference` ao `styles.css`.
- Fonte: JetBrains Mono (Google Fonts, `index.html`). Inputs usam 16px no mobile (evita zoom no iOS).

## Comandos do terminal

| Comando | Apelidos | Descrição |
| --- | --- | --- |
| `help [comando]` | `ajuda`, `?` | lista comandos públicos ou detalha um |
| `sobre` | `whoami` | apresentação, habilidades e links |
| `curriculo` | `cv`, `resume` | experiência, formação, habilidades, link do PDF |
| `projetos` | `projects` | lista projetos (clicáveis) |
| `visualizar-projeto <nome>` | `vp`, `ver` | imagem, título, descrição e link do projeto |
| `contato` | `contact` | e-mail e links |
| `ls [caminho]` / `cd [caminho]` / `pwd` / `cat <arquivo>` | | navegação no sistema de arquivos virtual |
| `historico`, `echo`, `data`, `banner`, `clear` | | utilitários |
| `edit-infos-minhas` | — | **oculto**: redireciona para `/login` |
| `sudo` | — | **oculto**: easter egg |

Atalhos: `Tab` autocompleta (comandos, caminhos e slugs), `↑/↓` histórico, `Ctrl+L` limpa,
`Ctrl+C` cancela a linha.

### Sistema de arquivos virtual

Derivado do `PortfolioStore` (projetos criados no painel aparecem automaticamente):

```
/home/visitante  (~)
├── README.md  sobre.txt  curriculo.txt  contato.txt
└── projetos/<slug-de-cada-projeto>
```

### Como adicionar um comando

1. Crie a classe estendendo `Command` (`terminal/commands/command.ts`) — defina `name`,
   `description`, opcionalmente `usage`, `aliases`, `hidden` e `complete()` (Tab).
2. `execute(ctx)` retorna `OutputBlock[]` usando a fábrica `Out` (`terminal/output.ts`).
   O `ctx` traz `args`, `fs`, `store`, `registry`, `session` e `router`.
3. Registre a instância em `terminal/commands/index.ts` (a ordem define a ordem no `help`).
4. Se precisar de um tipo novo de saída: adicione ao union `OutputBlock`
   (`core/models/terminal.model.ts`) e um `@case` em `output-block.html`.

Regras: **nunca** renderize conteúdo via `innerHTML` (os dados são editáveis pelo usuário);
comandos com `hidden = true` não podem aparecer no `help`, no autocompletar nem em sugestões
(há testes garantindo isso).

## Persistência e autenticação

Não há backend. Tudo passa por duas abstrações registradas em `app.config.ts`:

- **`PortfolioRepository`** → `LocalStoragePortfolioRepository`
  - lê edições do `localStorage` (`portfolio-terminal:data:v1`); se não houver, carrega o seed
    `public/data/portfolio.json`;
  - salva no `localStorage` **do navegador atual**. Para publicar para todos os visitantes:
    painel → aba **dados** → exportar JSON → substituir `public/data/portfolio.json` → deploy.
- **`AuthService`** → `LocalAuthService`
  - compara `sha256(salt:senha)` com `ADMIN_CONFIG` (`core/config/admin.config.ts`);
    sessão no `sessionStorage` com expiração; bloqueio temporário após 5 erros;
  - **é uma barreira apenas no navegador**: esconde o painel, mas não é segurança real
    (o hash está no bundle e os dados ficam no cliente);
  - Web Crypto exige HTTPS ou `localhost`.
- Credenciais padrão: usuário `admin`, senha `terminal@admin`. **Troque antes de publicar**:
  `npm run hash-password -- "sua-senha"` e cole `salt`/`passwordHash` em `admin.config.ts`.

Para um backend real (API própria, Firebase, Supabase...): crie classes que estendam
`PortfolioRepository` e `AuthService` e troque os providers em `app.config.ts` — nenhum
componente precisa mudar.

### Imagens

- Seed: arquivos em `public/images/projects/` referenciados como `images/projects/x.svg`.
- Painel: URL (http/https ou caminho relativo) ou upload — o upload é redimensionado
  (`imageFileToDataUrl`) e salvo como data URL. O `localStorage` tem ~5 MB; prefira URLs
  ou arquivos em `public/` para o conteúdo publicado.

## Convenções

- Componentes standalone, `ChangeDetectionStrategy.OnPush`, `input()`/`output()`, `inject()`,
  signals para estado; sem sufixo `Component` no nome da classe (padrão Angular 21).
- Estado compartilhado só via `PortfolioStore`; componentes não acessam `localStorage`.
- Dados externos (seed, import, localStorage) sempre passam por `normalizePortfolioData`.
- Sem `window.confirm/alert`: use `app-confirm-button` e `Feedback` + `app-feedback-message`.
- Formulários: envolva campos em `app-form-field` e use `errorOf(control)` para a mensagem.
- Textos de UI em pt-BR, tom de terminal (minúsculas em rótulos, `[ abas ]`, `## títulos`).
- Testes ficam ao lado do código (`*.spec.ts`); use `InMemoryPortfolioRepository`
  (`src/testing/portfolio-fixtures.ts`) para testar sem `localStorage`/HTTP.
