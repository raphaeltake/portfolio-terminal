import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Profile } from '../../../core/models/portfolio.model';

/** Saída do comando `sobre`: apresentação, habilidades e links. */
@Component({
  selector: 'app-profile-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="max-w-3xl space-y-4">
      <header class="flex items-center gap-4">
        @if (profile().avatarUrl) {
          <img
            class="size-20 shrink-0 rounded border border-line-strong object-cover"
            [src]="profile().avatarUrl"
            [alt]="'Foto de ' + profile().name"
          />
        }
        <div class="min-w-0">
          <h2 class="glow text-xl font-bold text-primary">{{ profile().name }}</h2>
          @if (profile().role) {
            <p>{{ profile().role }}</p>
          }
          @if (profile().location) {
            <p class="text-sm text-muted">local: {{ profile().location }}</p>
          }
        </div>
      </header>

      @if (profile().bio) {
        <p class="whitespace-pre-line">{{ profile().bio }}</p>
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

      @if (profile().links.length) {
        <div class="space-y-1">
          <h3 class="section-title">links</h3>
          <ul class="flex flex-wrap gap-x-5 gap-y-1">
            @for (link of profile().links; track link.url) {
              <li>
                <a class="link" [href]="link.url" target="_blank" rel="noopener noreferrer">{{
                  link.label
                }}</a>
              </li>
            }
          </ul>
        </div>
      }
    </section>
  `,
})
export class ProfileView {
  readonly profile = input.required<Profile>();
}
