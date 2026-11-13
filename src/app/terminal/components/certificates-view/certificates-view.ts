import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import type { Certificate } from '../../../core/models/portfolio.model';
import { ZoomableImage } from '../../../shared/components/zoomable-image/zoomable-image';

/** Lista de certificados: comando `certificados` e seção do `curriculo`. */
@Component({
  selector: 'app-certificates-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ZoomableImage],
  host: { class: 'block' },
  template: `
    <ul class="max-w-3xl space-y-3">
      @for (item of certificates(); track $index) {
        <li class="border-l-2 border-line-strong pl-3">
          <p class="font-bold text-primary">{{ item.name }}</p>
          @if (item.issuer || item.date) {
            <p>
              {{ item.issuer }}
              @if (item.issuer && item.date) {
                <span class="text-muted"> · </span>
              }
              <span class="text-muted">{{ item.date }}</span>
            </p>
          }
          @if (item.imageUrl) {
            <app-zoomable-image class="my-2 max-w-xs" [src]="item.imageUrl" [alt]="item.name" />
          }
          @if (item.url) {
            <a class="link text-sm" [href]="item.url" target="_blank" rel="noopener noreferrer">
              ↗ ver credencial
            </a>
          }
        </li>
      }
    </ul>
  `,
})
export class CertificatesView {
  readonly certificates = input.required<Certificate[]>();
}
