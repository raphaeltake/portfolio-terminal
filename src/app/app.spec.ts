import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { ViewSwitcher } from './core/navigation/view-switcher';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('cria a aplicação com o router-outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('router-outlet')).not.toBeNull();
  });

  it('não bloqueia a digitação de teclas comuns', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true, bubbles: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('encaminha Ctrl+F1 para o ViewSwitcher', () => {
    const toggle = vi.spyOn(TestBed.inject(ViewSwitcher), 'toggle').mockResolvedValue(true);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'F1', ctrlKey: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(toggle).toHaveBeenCalledOnce();
  });
});
