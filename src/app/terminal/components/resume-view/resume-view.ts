import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Profile } from '../../../core/models/portfolio.model';

/** Saída do comando `curriculo`. */
@Component({
  selector: 'app-resume-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="max-w-3xl space-y-5">
      <header class="border-b border-dashed border-line-strong pb-3">
        <h2 class="glow text-xl font-bold text-primary">{{ profile().name }}</h2>
        <p>{{ profile().role }}</p>
        <p class="text-sm text-muted">
          {{ profile().location }}
          @if (profile().location && profile().email) {
            ·
          }
          @if (profile().email) {
            <a class="link" [href]="'mailto:' + profile().email">{{ profile().email }}</a>
          }
        </p>
      </header>

      @if (profile().bio) {
        <div class="space-y-1">
          <h3 class="section-title">resumo</h3>
          <p class="whitespace-pre-line">{{ profile().bio }}</p>
        </div>
      }

      @if (profile().experiences.length) {
        <div class="space-y-3">
          <h3 class="section-title">experiência</h3>
          @for (item of profile().experiences; track $index) {
            <article class="border-l-2 border-line-strong pl-3">
              <p>
                <span class="font-bold text-primary">{{ item.role }}</span>
                @if (item.company) {
                  <span class="text-muted"> &#64; </span>{{ item.company }}
                }
              </p>
              <p class="text-xs text-muted">{{ item.period }}</p>
              @if (item.description) {
                <p class="mt-1 whitespace-pre-line">{{ item.description }}</p>
              }
            </article>
          }
        </div>
      }

      @if (profile().education.length) {
        <div class="space-y-3">
          <h3 class="section-title">formação</h3>
          @for (item of profile().education; track $index) {
            <article class="border-l-2 border-line-strong pl-3">
              <p class="font-bold text-primary">{{ item.course }}</p>
              <p>{{ item.institution }}</p>
              <p class="text-xs text-muted">{{ item.period }}</p>
            </article>
          }
        </div>
      }

      @if (profile().skills.length) {
        <div class="space-y-2">
          <h3 class="section-title">habilidades</h3>
          <ul class="flex flex-wrap gap-1.5">
            @for (skill of profile().skills; track skill) {
              <li class="tag">{{ skill }}</li>
            }
          </ul>
        </div>
      }

      @if (profile().resumeUrl) {
        <a
          class="btn btn-primary btn-sm"
          [href]="profile().resumeUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          ⇩ baixar currículo (PDF)
        </a>
      }
    </section>
  `,
})
export class ResumeView {
  readonly profile = input.required<Profile>();
}
