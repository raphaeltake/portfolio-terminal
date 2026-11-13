import { TestBed } from '@angular/core/testing';

import { InMemoryPortfolioRepository } from '../../../../testing/portfolio-fixtures';
import { PortfolioRepository } from '../../../core/data/portfolio-repository';
import { PortfolioStore } from '../../../core/state/portfolio-store';
import { ProfileForm } from './profile-form';

describe('ProfileForm (certificados)', () => {
  let store: PortfolioStore;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ProfileForm],
      providers: [{ provide: PortfolioRepository, useClass: InMemoryPortfolioRepository }],
    });
    store = TestBed.inject(PortfolioStore);
    await store.load();
  });

  async function render() {
    const fixture = TestBed.createComponent(ProfileForm);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const form = el.querySelector('form')!;
    return { fixture, el, form };
  }

  it('carrega a imagem do certificado no campo de imagem', async () => {
    const { el } = await render();
    // Foto do perfil + imagem do único certificado do fixture.
    const images = el.querySelectorAll('app-image-input');
    expect(images).toHaveLength(2);
    expect(images[1].querySelector('img')?.getAttribute('src')).toBe('images/certificado.png');
  });

  it('salva a imagem informada para o certificado', async () => {
    const { fixture, el, form } = await render();
    const urlInput = el.querySelectorAll<HTMLInputElement>('app-image-input input[type="text"]')[1];
    urlInput.value = 'images/certificates/novo.png';
    urlInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(store.profile().certificates[0].imageUrl).toBe('images/certificates/novo.png');
  });

  it('recusa imagem com protocolo inválido', async () => {
    const { fixture, el, form } = await render();
    const urlInput = el.querySelectorAll<HTMLInputElement>('app-image-input input[type="text"]')[1];
    urlInput.value = 'javascript:alert(1)';
    urlInput.dispatchEvent(new Event('input'));

    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(store.profile().certificates[0].imageUrl).toBe('images/certificado.png');
  });
});
