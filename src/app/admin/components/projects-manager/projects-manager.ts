import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import type { Project } from '../../../core/models/portfolio.model';
import { PortfolioStore, messageOf } from '../../../core/state/portfolio-store';
import { createId } from '../../../core/utils/text.utils';
import { ConfirmButton } from '../../../shared/components/confirm-button/confirm-button';
import { FeedbackMessage } from '../../../shared/components/feedback-message/feedback-message';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { Feedback } from '../../../shared/utils/feedback';
import { ProjectForm } from '../project-form/project-form';

/** Lista de projetos com ações (criar, editar, reordenar, excluir). */
@Component({
  selector: 'app-projects-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard, ProjectForm, ConfirmButton, FeedbackMessage],
  template: `
    @if (editing(); as project) {
      <app-project-form
        [project]="project"
        (saved)="onSaved($event)"
        (cancelled)="editing.set(null)"
      />
    } @else {
      <section class="space-y-4">
        <!-- Feedback na mesma linha do título: ao sumir, não desloca a lista. -->
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="section-title">projetos ({{ store.projects().length }})</h2>
          <app-feedback-message class="min-w-0 flex-1" [message]="feedback.message()" />
          <button type="button" class="btn btn-primary btn-sm ml-auto" (click)="create()">
            + novo projeto
          </button>
        </div>

        <ul class="space-y-3">
          @for (project of store.projects(); track project.id; let first = $first, last = $last) {
            <li>
              <app-project-card [project]="project" variant="compact">
                <div class="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    class="btn btn-sm"
                    [disabled]="first"
                    (click)="move(project, -1)"
                    aria-label="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="btn btn-sm"
                    [disabled]="last"
                    (click)="move(project, 1)"
                    aria-label="Mover para baixo"
                  >
                    ↓
                  </button>
                  <button type="button" class="btn btn-sm" (click)="editing.set(project)">
                    editar
                  </button>
                  <app-confirm-button label="excluir" (confirmed)="remove(project)" />
                </div>
              </app-project-card>
            </li>
          } @empty {
            <li class="panel p-6 text-center text-muted">
              Nenhum projeto ainda. Clique em "+ novo projeto" para começar.
            </li>
          }
        </ul>
      </section>
    }
  `,
})
export class ProjectsManager {
  protected readonly store = inject(PortfolioStore);
  protected readonly editing = signal<Project | null>(null);
  protected readonly feedback = new Feedback();

  protected create(): void {
    this.editing.set({
      id: createId(),
      slug: '',
      title: '',
      description: '',
      imageUrl: '',
      link: '',
      repoUrl: '',
      tags: [],
    });
  }

  protected onSaved(project: Project): void {
    this.editing.set(null);
    this.feedback.success(`Projeto "${project.title}" salvo.`);
  }

  protected async move(project: Project, offset: -1 | 1): Promise<void> {
    await this.run(() => this.store.moveProject(project.id, offset));
  }

  protected async remove(project: Project): Promise<void> {
    const ok = await this.run(() => this.store.deleteProject(project.id));
    if (ok) this.feedback.success(`Projeto "${project.title}" excluído.`);
  }

  private async run(action: () => Promise<void>): Promise<boolean> {
    try {
      await action();
      return true;
    } catch (error) {
      this.feedback.error(messageOf(error, 'Operação não concluída.'));
      return false;
    }
  }
}
