import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/** Foca o elemento assim que ele é renderizado: `<input appAutofocus />`. */
@Directive({ selector: '[appAutofocus]' })
export class Autofocus {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() => element.nativeElement.focus({ preventScroll: true }));
  }
}
