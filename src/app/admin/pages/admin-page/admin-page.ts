import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { TERMINAL_CONFIG } from '../../../core/config/terminal.config';
import { AuthService } from '../../../core/auth/auth.service';
import { TerminalWindow } from '../../../shared/components/terminal-window/terminal-window';
import { DataBackup } from '../../components/data-backup/data-backup';
import { ProfileForm } from '../../components/profile-form/profile-form';
import { ProjectsManager } from '../../components/projects-manager/projects-manager';

type AdminTab = 'perfil' | 'projetos' | 'dados';

/** Painel administrativo: edição do perfil, dos projetos e backup dos dados. */
@Component({
  selector: 'app-admin-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TerminalWindow, ProfileForm, ProjectsManager, DataBackup],
  templateUrl: './admin-page.html',
})
export class AdminPage {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly tabs: { id: AdminTab; label: string }[] = [
    { id: 'perfil', label: 'perfil' },
    { id: 'projetos', label: 'projetos' },
    { id: 'dados', label: 'dados' },
  ];
  protected readonly activeTab = signal<AdminTab>('perfil');
  protected readonly title = `${TERMINAL_CONFIG.adminUser}@${TERMINAL_CONFIG.host}: ~/admin`;

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
