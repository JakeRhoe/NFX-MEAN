import {
  Component,
  Directive,
  Input,
  Output,
  HostBinding,
  EventEmitter,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Injector,
  Renderer2,
  ComponentRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ComponentFactoryResolver,
  NgZone,
  style
} from '@angular/core';

import { listenToTriggers } from '@ng-bootstrap/ng-bootstrap/util/triggers';
import { positionElements, Placement, PlacementArray } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { PopupService } from '@ng-bootstrap/ng-bootstrap/util/popup';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap/popover/popover-config';


let nextId = 0;


@Component({
  selector: 'nfx-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content></ng-content>`,
  styles: [`
    :host(.popover) {
      background-color: rgba(0,0,0,0);
      border-radius: 0rem;
    }
  `]
})
export class NfxPopoverComponent {
  @Input() placement: Placement = 'top';

  @HostBinding('id') hostId: string;
  @HostBinding('class') hostClass = 'popover bs-popover-' + this.placement.split('-')[0] + ' bs-popover-' + this.placement;
  @HostBinding('attr.role') hostRole = 'tooltip';

  constructor(private _element: ElementRef, private _renderer: Renderer2) {}

  applyPlacement(_placement: Placement) {
    // remove the current placement classes
    this._renderer.removeClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString().split('-')[0]);
    this._renderer.removeClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString());

    // set the new placement classes
    this.placement = _placement;

    // apply the new placement
    this._renderer.addClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString().split('-')[0]);
    this._renderer.addClass(this._element.nativeElement, 'bs-popover-' + this.placement.toString());
  }
}

@Directive({selector: '[nfxPopover]', exportAs: 'nfxPopover'})
export class NfxPopoverDirective implements OnInit, OnDestroy {
  /**
   * Content to be displayed as popover.
   */
  @Input() nfxPopover: string | TemplateRef<any>;
  /**
   * Placement of a popover accepts:
   *    "top", "top-left", "top-right", "bottom", "bottom-left", "bottom-right",
   *    "left", "left-top", "left-bottom", "right", "right-top", "right-bottom"
   * and array of above values.
   */
  @Input() placement: PlacementArray;
  /**
   * Specifies events that should trigger. Supports a space separated list of event names.
   */
  @Input() triggers: string;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  @Input() container: string;
  /**
   * Emits an event when the popover is shown
   */
  @Output() shown = new EventEmitter();
  /**
   * Emits an event when the popover is hidden
   */
  @Output() hidden = new EventEmitter();

  private _nfxPopoverWindowId = `nfx-popover-${nextId++}`;
  private _popupService: PopupService<NfxPopoverComponent>;
  private _windowRef: ComponentRef<NfxPopoverComponent>;
  private _unregisterListenersFn;
  private _zoneSubscription: any;

  private _closeTimerId: any = 0;

  constructor(
      private _elementRef: ElementRef, private _renderer: Renderer2, injector: Injector,
      componentFactoryResolver: ComponentFactoryResolver, viewContainerRef: ViewContainerRef, config: NgbPopoverConfig,
      ngZone: NgZone) {
    this.placement = config.placement;
    this.triggers = config.triggers;
    this.container = config.container;
    this._popupService = new PopupService<NfxPopoverComponent>(
        NfxPopoverComponent, injector, viewContainerRef, _renderer, componentFactoryResolver);

    this._zoneSubscription = ngZone.onStable.subscribe(() => {
      if (this._windowRef) {
        this._windowRef.instance.applyPlacement(
            positionElements(
                this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
                this.container === 'body'));
      }
    });
  }

  /**
   * Opens an element’s popover. This is considered a “manual” triggering of the popover.
   * The context is an optional value to be injected into the popover template when it is created.
   */
  open(context?: any) {
    clearTimeout(this._closeTimerId);

    if (!this._windowRef) {
      this._windowRef = this._popupService.open(this.nfxPopover, context);
      this._windowRef.instance.hostId = this._nfxPopoverWindowId;

      this._renderer.setAttribute(this._elementRef.nativeElement, 'aria-describedby', this._nfxPopoverWindowId);

      if (this.container === 'body') {
        window.document.querySelector(this.container).appendChild(this._windowRef.location.nativeElement);
      }

      // apply styling to set basic css-classes on target element, before going for positioning
      this._windowRef.changeDetectorRef.detectChanges();
      this._windowRef.changeDetectorRef.markForCheck();

      // position popover along the element
      this._windowRef.instance.applyPlacement(
          positionElements(
              this._elementRef.nativeElement, this._windowRef.location.nativeElement, this.placement,
              this.container === 'body'));

      this.shown.emit();
    }
  }

  /**
   * Closes an element’s popover. This is considered a “manual” triggering of the popover.
   */
  close(delayTime?: number): void {
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // return;
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function closeFunc(drtv: NfxPopoverDirective) {
      if (drtv._windowRef) {
        drtv._renderer.removeAttribute(drtv._elementRef.nativeElement, 'aria-describedby');
        drtv._popupService.close();
        drtv._windowRef = null;
        drtv.hidden.emit();
      }
    }

    clearTimeout(this._closeTimerId);
    this._closeTimerId = setTimeout(() => closeFunc(this), delayTime);
  }

  /**
   * Toggles an element’s popover. This is considered a “manual” triggering of the popover.
   */
  toggle(): void {
    if (this._windowRef) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Returns whether or not the popover is currently being shown
   */
  isOpen(): boolean { return this._windowRef != null; }

  ngOnInit() {
    this._unregisterListenersFn = listenToTriggers(
        this._renderer, this._elementRef.nativeElement, this.triggers, this.open.bind(this), this.close.bind(this),
        this.toggle.bind(this));
  }

  ngOnDestroy() {
    this.close();
    this._unregisterListenersFn();
    this._zoneSubscription.unsubscribe();
  }
}
