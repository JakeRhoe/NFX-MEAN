import {
  Directive,
  OnDestroy,
  HostListener,
  Input,
  Inject
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { windowRefProvider, WINDOW_REF } from '../../../service/window/window.service';


@Directive({
  selector: '[nfxJumpToBookmark]',
  providers: [ windowRefProvider ]
})
export class NfxJumpToBookmarkDirective implements OnDestroy {
  // tslint:disable-next-line:no-input-rename
  @Input('nfxJumpToBookmark') bookmarkId: string = null;
  @Input() jumpDelay: number = null;
  private tmBookmark: number = null;

  constructor(@Inject(WINDOW_REF) private window: Window) {
    this.jumpDelay = 0;
  }

  ngOnDestroy(): void {
    if (this.tmBookmark) {
      this.window.clearTimeout(this.tmBookmark);
    }
  }

  @HostListener('click', ['$event']) onClickJump(event: Event) {
    if (!this.window) {
      return;
    }

    const elmnt = this.window.document.querySelector(`#${this.bookmarkId}`);

    if (elmnt) {
      this.tmBookmark = this.window.setTimeout(
        () => { elmnt.scrollIntoView(); },
        this.jumpDelay);
    }
  }
}
