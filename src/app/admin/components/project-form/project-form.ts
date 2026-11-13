import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

import type { Project } from '../../../core/models/portfolio.model';
import { PortfolioStore, messageOf } from '../../../core/state/portfolio-store';
import { slugify, splitList } from '../../../core/utils/text.utils';
import { FeedbackMessage } from '../../../shared/components/feedback-message/feedback-message';
import { FormField } from '../../../shared/components/form-field/form-field';
import { ImageInput } from '../../../shared/components/image-input/image-input';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { Feedback } from '../../../shared/utils/feedback';
import { errorOf, imageSourceValidator, urlValidator } from '../../../shared/utils/form-errors';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Formulário de criação/edição de projeto, com pré-visualização ao vivo. */
@Component({
  selector: 'app-project-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormField, ImageInput, ProjectCard, FeedbackMessage],
  templateUrl: './project-form.html',
})
export class ProjectForm implements OnInit {
  private readonly store = inject(PortfolioStore);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly project = input.required<Project>();
  readonly saved = output<Project>();
  readonly cancelled = output<void>();

  /** Id do projeto em edição (definido no ngOnInit, usado pelo validador de slug). */
  private projectId = '';
  /** Enquanto o slug não for editado à mão, ele acompanha o título. */
  private slugLinkedToTitle = false;

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    slug: [
      '',
      [
        Validators.required,
        Validators.pattern(SLUG_PATTERN),
        (c: AbstractControl) => this.uniqueSlug(c),
      ],
    ],
    description: ['', Validators.required],
    imageUrl: ['', imageSourceValidator],
    link: ['', [Validators.required, urlValidator]],
    repoUrl: ['', urlValidator],
    tags: [''],
  });

  protected readonly isNew = signal(false);
  protected readonly saving = signal(false);
  protected readonly feedback = new Feedback();
  protected readonly errorOf = errorOf;

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Projeto montado a partir do formulário, para a pré-visualização. */
  protected readonly preview = computed<Project>(() => {
    this.formValue();
    const project = this.buildProject();
    return {
      ...project,
      title: project.title || 'Título do projeto',
      slug: project.slug || 'nome-do-projeto',
      description: project.description || 'A descrição aparecerá aqui.',
    };
  });

  constructor() {
    this.form.controls.title.valueChanges.pipe(takeUntilDestroyed()).subscribe((title) => {
      if (this.slugLinkedToTitle) {
        this.form.controls.slug.setValue(slugify(title), { emitEvent: false });
      }
    });
  }

  ngOnInit(): void {
    const project = this.project();
    this.projectId = project.id;
    this.isNew.set(!this.store.projects().some((p) => p.id === project.id));
    this.slugLinkedToTitle = this.isNew() && !project.slug;

    this.form.setValue({
      title: project.title,
      slug: project.slug,
      description: project.description,
      imageUrl: project.imageUrl,
      link: project.link,
      repoUrl: project.repoUrl,
      tags: project.tags.join(', '),
    });
  }

  /** Ao editar o slug manualmente, ele deixa de seguir o título. */
  protected onSlugInput(): void {
    this.slugLinkedToTitle = false;
  }

  protected normalizeSlug(): void {
    const control = this.form.controls.slug;
    control.setValue(slugify(control.value));
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback.error('Corrija os campos destacados antes de salvar.');
      return;
    }

    const project = this.buildProject();
    this.saving.set(true);
    try {
      await this.store.saveProject(project);
      this.saved.emit(project);
    } catch (error) {
      this.feedback.error(messageOf(error, 'Não foi possível salvar o projeto.'));
    } finally {
      this.saving.set(false);
    }
  }

  private buildProject(): Project {
    const value = this.form.getRawValue();
    return {
      id: this.projectId,
      slug: value.slug.trim(),
      title: value.title.trim(),
      description: value.description.trim(),
      imageUrl: value.imageUrl.trim(),
      link: value.link.trim(),
      repoUrl: value.repoUrl.trim(),
      tags: splitList(value.tags),
    };
  }

  private uniqueSlug(control: AbstractControl): ValidationErrors | null {
    const slug = String(control.value ?? '').toLowerCase();
    const taken = this.store
      .projects()
      .some((p) => p.slug.toLowerCase() === slug && p.id !== this.projectId);
    return taken ? { slugTaken: true } : null;
  }
}
