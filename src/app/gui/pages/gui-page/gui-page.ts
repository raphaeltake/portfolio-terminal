import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PortfolioStore } from '../../../core/state/portfolio-store';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { ViewToggle } from '../../../shared/components/view-toggle/view-toggle';

interface Section {
  id: string;
  label: string;
}

/** Versão gráfica do portfólio: o mesmo conteúdo do terminal, sem precisar digitar. */
@Component({
  selector: 'app-gui-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard, ViewToggle],
  templateUrl: './gui-page.html',
})
export class GuiPage {
  protected readonly store = inject(PortfolioStore);
  protected readonly profile = this.store.profile;
  protected readonly projects = this.store.projects;
  protected readonly year = new Date().getFullYear();

  protected readonly hasCareer = computed(
    () => this.profile().experiences.length > 0 || this.profile().education.length > 0,
  );
  protected readonly hasContact = computed(
    () => !!this.profile().email || this.profile().links.length > 0,
  );

  /** Seções exibidas na navegação (só as que têm conteúdo). */
  protected readonly sections = computed<Section[]>(() => [
    { id: 'sobre', label: 'sobre' },
    ...(this.hasCareer() ? [{ id: 'carreira', label: 'carreira' }] : []),
    { id: 'projetos', label: 'projetos' },
    ...(this.hasContact() ? [{ id: 'contato', label: 'contato' }] : []),
  ]);

  /** Iniciais para o avatar quando não há foto. */
  protected readonly initials = computed(() => {
    const words = this.profile().name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return '>_';
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : '';
    return (first + last).toUpperCase();
  });

  /**
   * Rola até a seção. Não usa `href="#id"` porque, com `<base href="/">`,
   * o link resolveria para `/#id` e voltaria ao terminal.
   */
  protected scrollTo(id: string): void {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
}
