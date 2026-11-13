import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { Project } from '../../../core/models/portfolio.model';

/**
 * Cartão de projeto: imagem, título, descrição e links.
 * - `full`: usado no terminal (`visualizar-projeto`) e na pré-visualização do formulário.
 * - `compact`: usado na listagem do painel; o conteúdo projetado vira a área de ações.
 */
@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <article
      class="panel overflow-hidden"
      [class]="compact() ? 'flex flex-col gap-3 p-3 sm:flex-row sm:items-center' : 'max-w-2xl'"
    >
      <figure
        class="relative shrink-0 overflow-hidden bg-elevated"
        [class]="
          compact()
            ? 'aspect-video w-full rounded border border-line sm:w-36'
            : 'aspect-video w-full border-b border-line'
        "
      >
        @if (showImage()) {
          <img
            class="size-full object-cover"
            [src]="project().imageUrl"
            [alt]="'Imagem do projeto ' + project().title"
            loading="lazy"
            (error)="failedUrl.set(project().imageUrl)"
          />
        } @else {
          <div class="flex size-full items-center justify-center text-xs text-muted">
            [ sem imagem ]
          </div>
        }
      </figure>

      <div class="min-w-0 flex-1 space-y-2" [class.p-4]="!compact()">
        <header>
          <h3 class="glow text-lg leading-tight font-bold text-primary">{{ project().title }}</h3>
          <p class="text-xs text-muted">~/projetos/{{ project().slug }}</p>
        </header>

        @if (!compact()) {
          <p class="whitespace-pre-line">{{ project().description }}</p>
        }

        @if (project().tags.length) {
          <ul class="flex flex-wrap gap-1.5" aria-label="Tecnologias">
            @for (tag of project().tags; track tag) {
              <li class="tag">{{ tag }}</li>
            }
          </ul>
        }

        @if (!compact() && (project().link || project().repoUrl)) {
          <div class="flex flex-wrap gap-2 pt-1">
            @if (project().link) {
              <a
                class="btn btn-primary btn-sm"
                [href]="project().link"
                target="_blank"
                rel="noopener noreferrer"
              >
                ↗ acessar projeto
              </a>
            }
            @if (project().repoUrl) {
              <a
                class="btn btn-sm"
                [href]="project().repoUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                &lt;/&gt; repositório
              </a>
            }
          </div>
        }
      </div>

      <ng-content />
    </article>
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly variant = input<'full' | 'compact'>('full');

  protected readonly compact = computed(() => this.variant() === 'compact');
  /** Guarda a URL que falhou para mostrar o placeholder sem "piscar". */
  protected readonly failedUrl = signal<string | null>(null);
  protected readonly showImage = computed(() => {
    const url = this.project().imageUrl;
    return !!url && url !== this.failedUrl();
  });
}
