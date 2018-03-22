import {
  Directive,
  Input,
  ViewContainerRef
} from '@angular/core';


@Directive({ selector: '[nfxTitleSlideItem]' })
export class NfxTitleSlideItemDirective {
  @Input() hoverDelay = 0;
  @Input() navEffectDelay = 0;

  constructor(public viewContainerRef: ViewContainerRef) {}
}
