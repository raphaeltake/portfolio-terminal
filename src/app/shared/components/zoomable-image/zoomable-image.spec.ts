import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomableImage } from './zoomable-image';

describe('ZoomableImage', () => {
  let fixture: ComponentFixture<ZoomableImage>;
  let el: HTMLElement;

  async function render(src: string): Promise<void> {
    fixture = TestBed.createComponent(ZoomableImage);
    fixture.componentRef.setInput('src', src);
    fixture.componentRef.setInput('alt', 'Certificado AWS');
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  }

  it('mostra a miniatura e abre/fecha a imagem ampliada', async () => {
    await render('images/aws.png');
    const dialog = el.querySelector('dialog')!;
    expect(el.querySelector('button img')?.getAttribute('src')).toBe('images/aws.png');
    expect(dialog.open).toBe(false);

    el.querySelector<HTMLButtonElement>('button[aria-label^="Ampliar"]')!.click();
    expect(dialog.open).toBe(true);
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('images/aws.png');

    dialog.click();
    expect(dialog.open).toBe(false);
  });

  it('não exibe nada sem imagem ou se a imagem falhar', async () => {
    await render('');
    expect(el.querySelector('img')).toBeNull();

    await render('images/quebrada.png');
    el.querySelector('img')!.dispatchEvent(new Event('error'));
    await fixture.whenStable();
    expect(el.querySelector('img')).toBeNull();
  });
});
