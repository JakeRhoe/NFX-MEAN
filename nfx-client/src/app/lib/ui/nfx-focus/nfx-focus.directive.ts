import {
  Directive,
  Inject,
  OnChanges,
  OnDestroy,
  Input,
  ElementRef,
  SimpleChanges
 } from '@angular/core';

import { windowRefProvider, WINDOW_REF } from '../../../service/window/window.service';


@Directive({
  selector: '[nfxSetFocus]',
  exportAs: 'nfxSetFocus',
  providers: [ windowRefProvider ]
})
export class NfxFocusDirective implements OnChanges, OnDestroy {
  // tslint:disable-next-line:no-input-rename
  @Input('nfxSetFocus') isFocused: boolean;
  @Input() focusDelay: number;

  private tmFocus: number = null;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private elementRef: ElementRef) {
    this.focusDelay = 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    (this.isFocused) ? this.setFocus() : this.clearFocus();
  }

  ngOnDestroy(): void {
    this.clearFocus();
  }

  setFocus(): void {
    this.clearFocus();

    this.tmFocus = this.window.setTimeout(
      () => { this.elementRef.nativeElement.focus(); },
      this.focusDelay
    );
  }

  clearFocus(): void {
    if (this.tmFocus) {
      this.window.clearTimeout(this.tmFocus);
    }
  }
}
