import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import type {
  Certificate,
  Education,
  Experience,
  Profile,
  SocialLink,
} from '../../../core/models/portfolio.model';
import { PortfolioStore, messageOf } from '../../../core/state/portfolio-store';
import { splitList } from '../../../core/utils/text.utils';
import { FeedbackMessage } from '../../../shared/components/feedback-message/feedback-message';
import { FormField } from '../../../shared/components/form-field/form-field';
import { ImageInput } from '../../../shared/components/image-input/image-input';
import { Feedback } from '../../../shared/utils/feedback';
import { errorOf, imageSourceValidator, urlValidator } from '../../../shared/utils/form-errors';

type LinkGroup = FormGroup<{ label: FormControl<string>; url: FormControl<string> }>;
type ExperienceGroup = FormGroup<{
  role: FormControl<string>;
  company: FormControl<string>;
  period: FormControl<string>;
  description: FormControl<string>;
}>;
type EducationGroup = FormGroup<{
  course: FormControl<string>;
  institution: FormControl<string>;
  period: FormControl<string>;
}>;
type CertificateGroup = FormGroup<{
  name: FormControl<string>;
  issuer: FormControl<string>;
  date: FormControl<string>;
  url: FormControl<string>;
  imageUrl: FormControl<string>;
}>;

/** Formulário de edição das informações pessoais e do currículo. */
@Component({
  selector: 'app-profile-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormField, ImageInput, FeedbackMessage],
  templateUrl: './profile-form.html',
})
export class ProfileForm {
  private readonly store = inject(PortfolioStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    role: ['', Validators.maxLength(120)],
    location: [''],
    email: ['', Validators.email],
    bio: [''],
    avatarUrl: ['', imageSourceValidator],
    resumeUrl: ['', urlValidator],
    skills: [''],
    links: this.fb.array<LinkGroup>([]),
    experiences: this.fb.array<ExperienceGroup>([]),
    education: this.fb.array<EducationGroup>([]),
    certificates: this.fb.array<CertificateGroup>([]),
  });

  protected readonly saving = signal(false);
  protected readonly feedback = new Feedback();
  protected readonly errorOf = errorOf;

  constructor() {
    this.load(this.store.profile());
  }

  protected get links() {
    return this.form.controls.links;
  }

  protected get experiences() {
    return this.form.controls.experiences;
  }

  protected get education() {
    return this.form.controls.education;
  }

  protected get certificates() {
    return this.form.controls.certificates;
  }

  protected addLink(link?: SocialLink): void {
    this.links.push(
      this.fb.group({
        label: [link?.label ?? '', Validators.required],
        url: [link?.url ?? '', [Validators.required, urlValidator]],
      }),
    );
  }

  protected addExperience(item?: Experience): void {
    this.experiences.push(
      this.fb.group({
        role: [item?.role ?? '', Validators.required],
        company: [item?.company ?? ''],
        period: [item?.period ?? ''],
        description: [item?.description ?? ''],
      }),
    );
  }

  protected addEducation(item?: Education): void {
    this.education.push(
      this.fb.group({
        course: [item?.course ?? '', Validators.required],
        institution: [item?.institution ?? ''],
        period: [item?.period ?? ''],
      }),
    );
  }

  protected addCertificate(item?: Certificate): void {
    this.certificates.push(
      this.fb.group({
        name: [item?.name ?? '', Validators.required],
        issuer: [item?.issuer ?? ''],
        date: [item?.date ?? ''],
        url: [item?.url ?? '', urlValidator],
        imageUrl: [item?.imageUrl ?? '', imageSourceValidator],
      }),
    );
  }

  /** Remove um item de um FormArray. */
  protected remove(array: FormArray, index: number): void {
    array.removeAt(index);
    this.form.markAsDirty();
  }

  /** Move um item de um FormArray para cima/baixo. */
  protected move(array: FormArray, index: number, offset: -1 | 1): void {
    const target = index + offset;
    if (target < 0 || target >= array.length) return;
    const control = array.at(index);
    array.removeAt(index);
    array.insert(target, control);
    this.form.markAsDirty();
  }

  protected discard(): void {
    this.load(this.store.profile());
    this.feedback.clear();
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.feedback.error('Corrija os campos destacados antes de salvar.');
      return;
    }

    const value = this.form.getRawValue();
    const profile: Profile = {
      ...value,
      name: value.name.trim(),
      skills: splitList(value.skills),
    };

    this.saving.set(true);
    try {
      await this.store.updateProfile(profile);
      this.form.markAsPristine();
      this.feedback.success('Informações salvas.');
    } catch (error) {
      this.feedback.error(messageOf(error, 'Não foi possível salvar.'));
    } finally {
      this.saving.set(false);
    }
  }

  private load(profile: Profile): void {
    this.links.clear();
    this.experiences.clear();
    this.education.clear();
    this.certificates.clear();
    profile.links.forEach((link) => this.addLink(link));
    profile.experiences.forEach((item) => this.addExperience(item));
    profile.education.forEach((item) => this.addEducation(item));
    profile.certificates.forEach((item) => this.addCertificate(item));

    this.form.patchValue({
      name: profile.name,
      role: profile.role,
      location: profile.location,
      email: profile.email,
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      resumeUrl: profile.resumeUrl,
      skills: profile.skills.join(', '),
    });
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
