import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { ViewSwitcher, isViewShortcut, viewOf } from './view-switcher';

@Component({ template: '' })
class Blank {}

function keydown(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { cancelable: true, ...init });
}

describe('ViewSwitcher', () => {
  let switcher: ViewSwitcher;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: Blank },
          { path: 'gui', component: Blank },
          { path: 'login', component: Blank },
          { path: 'admin', component: Blank },
        ]),
      ],
    });
    router = TestBed.inject(Router);
    switcher = TestBed.inject(ViewSwitcher);
  });

  it('alterna terminal → gui → terminal', async () => {
    await router.navigateByUrl('/');
    expect(switcher.current()).toBe('terminal');

    await switcher.toggle();
    expect(router.url).toBe('/gui');
    expect(switcher.current()).toBe('gui');

    await switcher.toggle();
    expect(router.url).toBe('/');
    expect(switcher.current()).toBe('terminal');
  });

  it('não sai do login nem do painel', async () => {
    for (const url of ['/login', '/admin']) {
      await router.navigateByUrl(url);
      expect(await switcher.toggle()).toBe(false);
      expect(router.url).toBe(url);
      expect(switcher.current()).toBeNull();
    }
  });

  it('Ctrl+F1 alterna e impede a ação padrão do navegador', async () => {
    await router.navigateByUrl('/');
    const toggle = vi.spyOn(switcher, 'toggle');
    const event = keydown({ key: 'F1', ctrlKey: true });

    expect(switcher.handleKeydown(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(toggle).toHaveBeenCalledOnce();
  });

  it('ignora a repetição de tecla segurada', async () => {
    await router.navigateByUrl('/');
    const toggle = vi.spyOn(switcher, 'toggle');

    switcher.handleKeydown(keydown({ key: 'F1', ctrlKey: true, repeat: true }));
    expect(toggle).not.toHaveBeenCalled();
  });

  it('ignora outras teclas e o atalho fora do portfólio', async () => {
    await router.navigateByUrl('/');
    const toggle = vi.spyOn(switcher, 'toggle');

    const plainF1 = keydown({ key: 'F1' });
    expect(switcher.handleKeydown(plainF1)).toBe(false);
    expect(plainF1.defaultPrevented).toBe(false);

    await router.navigateByUrl('/admin');
    const inAdmin = keydown({ key: 'F1', ctrlKey: true });
    expect(switcher.handleKeydown(inAdmin)).toBe(false);
    expect(inAdmin.defaultPrevented).toBe(false);

    expect(toggle).not.toHaveBeenCalled();
  });
});

describe('isViewShortcut', () => {
  it('aceita só Ctrl+F1 sem outros modificadores', () => {
    expect(isViewShortcut(keydown({ key: 'F1', ctrlKey: true }))).toBe(true);
    expect(isViewShortcut(keydown({ key: 'F1' }))).toBe(false);
    expect(isViewShortcut(keydown({ key: 'F1', ctrlKey: true, shiftKey: true }))).toBe(false);
    expect(isViewShortcut(keydown({ key: 'F1', ctrlKey: true, altKey: true }))).toBe(false);
    expect(isViewShortcut(keydown({ key: 'F2', ctrlKey: true }))).toBe(false);
  });
});

describe('viewOf', () => {
  it('identifica a visualização pela URL', () => {
    expect(viewOf('/')).toBe('terminal');
    expect(viewOf('/?x=1')).toBe('terminal');
    expect(viewOf('/gui')).toBe('gui');
    expect(viewOf('/gui/#projetos')).toBe('gui');
    expect(viewOf('/login')).toBeNull();
    expect(viewOf('/admin')).toBeNull();
    expect(viewOf('/guia')).toBeNull();
  });
});
