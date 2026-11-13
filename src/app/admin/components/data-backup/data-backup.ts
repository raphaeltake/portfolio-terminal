import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PortfolioStore, messageOf } from '../../../core/state/portfolio-store';
import { downloadTextFile } from '../../../core/utils/browser.utils';
import { ConfirmButton } from '../../../shared/components/confirm-button/confirm-button';
import { FeedbackMessage } from '../../../shared/components/feedback-message/feedback-message';
import { Feedback } from '../../../shared/utils/feedback';

/** Exportar/importar o JSON do portfólio e restaurar os dados iniciais. */
@Component({
  selector: 'app-data-backup',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ConfirmButton, FeedbackMessage],
  template: `
    <section class="max-w-3xl space-y-6">
      <div class="space-y-2">
        <h2 class="section-title">como publicar as alterações</h2>
        <p class="alert alert-warning">
          As edições ficam salvas apenas <strong>neste navegador</strong> (localStorage). Para que
          todos os visitantes vejam, exporte o JSON e substitua o arquivo
          <code class="text-primary">public/data/portfolio.json</code> do projeto antes do deploy.
        </p>
        <p class="text-sm text-muted">Tamanho atual dos dados: {{ sizeKb() }} KB</p>
      </div>

      <div class="panel space-y-3 p-4">
        <h3 class="font-bold text-primary">exportar</h3>
        <p class="text-sm text-muted">Baixa um arquivo portfolio.json com perfil e projetos.</p>
        <button type="button" class="btn btn-primary btn-sm" (click)="exportJson()">
          ⇩ exportar JSON
        </button>
      </div>

      <div class="panel space-y-3 p-4">
        <h3 class="font-bold text-primary">importar</h3>
        <p class="text-sm text-muted">Substitui todos os dados atuais pelo conteúdo do arquivo.</p>
        <label class="btn btn-sm">
          ⇪ escolher arquivo .json
          <input
            class="sr-only"
            type="file"
            accept="application/json,.json"
            (change)="importJson($event)"
          />
        </label>
      </div>

      <div class="panel space-y-3 p-4">
        <h3 class="font-bold text-danger">restaurar dados iniciais</h3>
        <p class="text-sm text-muted">
          Descarta as edições deste navegador e volta ao conteúdo de public/data/portfolio.json.
        </p>
        <app-confirm-button
          label="restaurar"
          confirmLabel="clique para confirmar"
          (confirmed)="reset()"
        />
      </div>

      <app-feedback-message [message]="feedback.message()" />
    </section>
  `,
})
export class DataBackup {
  private readonly store = inject(PortfolioStore);
  protected readonly feedback = new Feedback();
  protected readonly sizeKb = computed(() =>
    (new Blob([JSON.stringify(this.store.data())]).size / 1024).toFixed(1),
  );

  protected exportJson(): void {
    downloadTextFile('portfolio.json', this.store.exportJson());
    this.feedback.success('Arquivo portfolio.json gerado.');
  }

  protected async importJson(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    try {
      await this.store.importData(JSON.parse(await file.text()));
      this.feedback.success(`Dados importados de ${file.name}.`);
    } catch (error) {
      const message = error instanceof SyntaxError ? 'O arquivo não é um JSON válido.' : null;
      this.feedback.error(message ?? messageOf(error, 'Falha ao importar.'));
    }
  }

  protected async reset(): Promise<void> {
    try {
      await this.store.reset();
      this.feedback.success('Dados iniciais restaurados.');
    } catch (error) {
      this.feedback.error(messageOf(error, 'Falha ao restaurar.'));
    }
  }
}
