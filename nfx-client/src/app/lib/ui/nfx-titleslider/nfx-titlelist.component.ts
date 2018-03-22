import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  Input,
  ViewChild,
  Inject,
  ComponentFactory,
  ComponentFactoryResolver,
  ElementRef,
  Renderer2,
  ComponentRef,
  Output,
  EventEmitter
} from '@angular/core';

import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';

import { windowRefProvider, WINDOW_REF } from '../../../service/window/window.service';
import { NfxTitleSlideItemDirective } from './nfx-titleslideitem.directive';
import { NfxTitleSlideItemComponent } from './nfx-titleslideitem.component';
import { ItemCollapseEvent, TitleSlideListUpdatedEvent } from '../../../service/title/title-slide.event';
import { ItemSelectedEvent } from '../../../service/title/title-slide.event';
import { TitleSlideService } from '../../../service/title/title-slide.service';
import { ProfileInfoServcie } from '../../../service/profile/profileinfo.service';
import { MyListService } from '../../../service/title/mylist.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


@Component({
  selector: 'nfx-titlelist',
  templateUrl: './nfx-titlelist.component.html',
  styleUrls: ['./nfx-titlelist.component.scss'],
  providers: [ windowRefProvider ]
})
export class NfxTitleListComponent implements OnInit {
  @Input() currentPage: number = 0;
  @Input() titleSlideInfo: TitleSlideInfo = null;
  @Input() genreId: string = '';

  @Output() changeNumOfSlots = new EventEmitter<number>();
  @Output() clickMyList = new EventEmitter<number>();

  @ViewChild(NfxTitleSlideItemDirective) titleSlideItemDirective: NfxTitleSlideItemDirective;
  @ViewChild('titleSliderPanel', {read: ElementRef}) titleSliderPanel: ElementRef;

  
  public isNavEffect = false;
  public isSliderNavBtnHover = false;
  public isLeftAlign = false;
  public isRightAlign = false;
  public isVisibleNavLeft = false;
  public isVisibleNavRight = false;
  public arrPage: boolean[] = new Array();
  public showItemCollapseUI = false;
  public showBigTitleUI = false;
  public bigTitleEffect = false;
  public isMouseEnterPlay = false;
  public selectedSlideItem: TitleSlideItem = null;
  public overviewRunningTime = '';
  public imgOverviewFront: string = null;
  public imgOverviewBehind: string = null;
  public arrImgOverview: string[] = new Array();
  public showFrontImgOverview = true;
  public isMyList: boolean = false;

  private titleSlideItemCompFactory: ComponentFactory<NfxTitleSlideItemComponent> = null;
  private arrItem: number[] = null;
  private lastSlideItem: NfxTitleSlideItemComponent = null;
  private tmItemHover: number = null;
  private currentNumOfSlots = 0;
  private currentStartIndex: number = null;
  private numOfPages = 0;
  private tmNavEffect: number = null;
  private tmBigTitleEffect: number = null;
  private tmResize: number = null;
  private selectedItemIndex = -1;
  private tmAutoSelectItem: number = null;
  private currentImgOverview = 0;
  private tmOverviewImg: number = null;
  private tmLoadOverviewImg: number = null;
  private subsTitleSlideUpdated: Subscription = null;
  private subsItemCollapseEvent: Subscription = null;
  private subsItemSelectedEvent: Subscription = null;
  private subsUpdateMyList: Subscription = null;
  private subsDeleteMyList: Subscription = null;
  private myListItemIndex: number = -1;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private renderer: Renderer2,
    private titleSilderService: TitleSlideService,
    private profileInfoService: ProfileInfoServcie,
    private myListService: MyListService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) { }

  ngOnInit() {
    this.registerTitleListUpdatedEvent();
    this.registerItemCollapseEvent();
    this.registerItemSelectedEvent();
    this.registerUpdateMyListCallback();
    this.registerDeleteMyListCallback();
  }

  ngAfterViewInit() {
    this.initTitleSlider(this.titleSlideInfo);
  }

  ngOnDestroy() {
    if (this.tmItemHover) {
      this.window.clearTimeout(this.tmItemHover);
    }

    if (this.tmNavEffect) {
      this.window.clearTimeout(this.tmNavEffect);
    }

    if (this.tmBigTitleEffect) {
      this.window.clearTimeout(this.tmBigTitleEffect);
    }

    if (this.tmResize) {
      this.window.clearTimeout(this.tmResize);
    }

    if (this.tmAutoSelectItem) {
      this.window.clearTimeout(this.tmAutoSelectItem);
    }

    if (this.tmOverviewImg) {
      this.window.clearInterval(this.tmOverviewImg);
    }

    if (this.tmLoadOverviewImg) {
      this.window.clearTimeout(this.tmLoadOverviewImg);
    }

    if (this.subsTitleSlideUpdated) {
      this.subsTitleSlideUpdated.unsubscribe();
    }

    if (this.subsItemCollapseEvent) {
      this.subsItemCollapseEvent.unsubscribe();
    }

    if (this.subsItemSelectedEvent) {
      this.subsItemSelectedEvent.unsubscribe();
    }

    if (this.subsUpdateMyList) {
      this.subsUpdateMyList.unsubscribe();
    }

    if (this.subsDeleteMyList) {
      this.subsDeleteMyList.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event']) onWindowResize(event: Event) {
    if (this.tmResize) {
      this.window.clearTimeout(this.tmResize);
    }

    this.alignItems(true, false);

    this.tmResize = this.window.setTimeout(
      () => {
        this.updateTitleSlider();
      },
      200
    );
  }

  private registerTitleListUpdatedEvent() {
    this.subsTitleSlideUpdated = 
    this.titleSilderService.resTitleSlideListUpdatedEvent$
      .subscribe(
        titleSlideListUpdatedEvent => {
          this.onResTitleListUpdated(titleSlideListUpdatedEvent.titleSlideInfo);
        }
      );
  }

  private onResTitleListUpdated(titleSlideInfo: TitleSlideInfo) {
    this.initTitleSlider(titleSlideInfo);
  }

  private registerItemCollapseEvent() {
    this.subsItemCollapseEvent = 
    this.titleSilderService.resItemCollpaseEvent$
      .filter(itemCollapseEvent => itemCollapseEvent.isOpened)
      .subscribe(itemCollapseEvent => {
        this.onResItemCollapseEvent(itemCollapseEvent);
      }
    );
  }

  private onResItemCollapseEvent(itemCollapseEvent: ItemCollapseEvent) {
    if (this.showItemCollapseUI) {
      this.titleSilderService.setItemCollapseEvent(
        this.genreId,
        this.selectedItemIndex,
        false,
        this.currentPage);

      this.showItemCollapse(false);
    }
  }

  private registerItemSelectedEvent() {
    this.subsItemSelectedEvent =
    this.titleSilderService.resItemSelectedEvent$
      .subscribe(itemCollapseEvent => {
        this.onResItemSelectedEvent(itemCollapseEvent);
      }
    );
  }

  private onResItemSelectedEvent(itemSelectedEvent: ItemSelectedEvent) {
    if (itemSelectedEvent.genreId === this.genreId) {
      this.setSelectedItem(itemSelectedEvent.itemIndex);
    } else {
      this.selectedItemIndex = -1;
    }
  }

  private registerUpdateMyListCallback() {
    this.subsUpdateMyList = 
    this.myListService.resUpdateMyList$
    .pipe(
      tap(() => {
        if (this.myListItemIndex >= 0) {
          this.updateMyListButton(this.myListItemIndex);
          this.myListItemIndex = -1;
        }
      })
    )
    .filter(titleSlideInfo => (
      titleSlideInfo &&
      titleSlideInfo.genreId === this.genreId
      )
    )
    .subscribe((titleSlideInfo) => {
        this.onResUpdateMyList(titleSlideInfo);
    });
  }

  private onResUpdateMyList(titleSlideInfo: TitleSlideInfo) {
    this.titleSlideInfo = titleSlideInfo;
    this.resetTitleSlider(titleSlideInfo);
  }

  private registerDeleteMyListCallback() {
    this.subsDeleteMyList = 
    this.myListService.resDeleteMyList$
    .pipe(
      tap(() => {
        if (this.myListItemIndex >= 0) {
          this.updateMyListButton(this.myListItemIndex);
          this.myListItemIndex = -1;
        }
      })
    )
    .filter(titleSlideInfo => (
      titleSlideInfo &&
      titleSlideInfo.genreId === this.genreId
      )
    )
    .subscribe((titleSlideInfo) => {
      this.onResDeleteMyList(titleSlideInfo);
    });
  }

  private onResDeleteMyList(titleSlideInfo: TitleSlideInfo) {
    this.titleSlideInfo = titleSlideInfo;
    this.resetTitleSlider(titleSlideInfo);
    if (titleSlideInfo.titleSlideList.length == 0) {
      this.showItemCollapse(false);
    }
  }

  private getNumOfSlot(): number {
    if (this.lastSlideItem === undefined ||
      this.lastSlideItem == null ||
      this.lastSlideItem.getComputedElementWidth() <= 0) {
        return 0;
    }

    const numOfSlots: number = Math.floor(
      this.window.innerWidth / this.lastSlideItem.getComputedElementWidth()
    );

    return numOfSlots;
  }

  private initTitleSlider(titleSlideInfo: TitleSlideInfo) {
    this.currentNumOfSlots = 0;
    this.titleSlideItemDirective.viewContainerRef.clear();
    
    if (titleSlideInfo === undefined || titleSlideInfo == null) {
      this.showItemCollapse(false);
      return;
    }

    if (titleSlideInfo.titleSlideList === undefined ||
      titleSlideInfo.titleSlideList == null ||
      titleSlideInfo.titleSlideList.length < 1) {
      this.showItemCollapse(false);
    }

    this.titleSlideInfo = titleSlideInfo;
    this.showBigTitleUI = false;
    this.titleSlideItemCompFactory = this.componentFactoryResolver.resolveComponentFactory(NfxTitleSlideItemComponent);
    const slideItemCompRef = this.titleSlideItemDirective.viewContainerRef.createComponent(this.titleSlideItemCompFactory);
    this.lastSlideItem = <NfxTitleSlideItemComponent>slideItemCompRef.instance;

    this.updateTitleSlider(true);
  }

  private updateTitleSlider(fadeEffect: boolean = false) {
    const numOfSlots: number = this.getNumOfSlot();

    if (numOfSlots === this.currentNumOfSlots) {
      return;
    }

    const arrItem: number[] = this.createNavPage(numOfSlots);
    this.makeNavEffect(arrItem, fadeEffect);
    this.arrItem = arrItem;

    if (this.tmAutoSelectItem) {
      this.window.clearTimeout(this.tmAutoSelectItem);
    }

    this.tmAutoSelectItem = this.window.setTimeout(
      () => {
        if (
          this.showItemCollapseUI &&
          arrItem &&
          arrItem.length > 2
        ) {
          this.titleSilderService.setItemSelectedEvent(this.titleSlideInfo.genreId, arrItem[1], this.currentPage);
        }
      },
      500
    );
  }

  private createNavPage(numOfSlots: number): number[] {
    this.currentNumOfSlots = numOfSlots;
    const titleSlideList: TitleSlideItem[] = 
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];

    const arrItem = new Array();

    if (titleSlideList === undefined || titleSlideList == null) {
      arrItem.push(-1);
      return arrItem;
    }

    if (numOfSlots < 1 || titleSlideList.length <= 0) {
      arrItem.push(-1);
      return arrItem;
    }

    numOfSlots = numOfSlots + 2;

    this.numOfPages = Math.floor(titleSlideList.length / (numOfSlots - 2));
    this.numOfPages += (Math.ceil(titleSlideList.length % (numOfSlots - 2)) > 0) ? 1 : 0;
    this.changeNumOfSlots.emit(numOfSlots);
    
    let startIndex = (numOfSlots - 2) * this.currentPage;
    let index = 0;

    for (let i = 0; i < numOfSlots; i++) {
      if (i == 0 || i == (numOfSlots - 1)) {
        arrItem[i] = -1;
      } else {
        if (titleSlideList[index++]) {
          arrItem[i] = startIndex++;
        } else {
          arrItem[i] = -1;
        }
      }
    }

    return arrItem;
  }

  private makeNavEffect(
    arrItem: number[],
    fadeEffect: boolean) {
    if (arrItem === undefined || arrItem == null) {
      return;
    }

    const viewContainerRef = this.titleSlideItemDirective.viewContainerRef;
    const titleSlideList: TitleSlideItem[] = 
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    viewContainerRef.clear();

    for (let i = 0; i < arrItem.length; i++) {
      this.createSlideItem(arrItem[i], fadeEffect);
    }
  }

  private createSlideItem(
    itemIndex: number,
    fadeEffect: boolean) {
    const titleSlideList: TitleSlideItem[] =
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    const viewContainerRef = this.titleSlideItemDirective.viewContainerRef;

    let titleSlideItemComp: NfxTitleSlideItemComponent = null;

    let componentRef = null;
    componentRef = viewContainerRef.createComponent(this.titleSlideItemCompFactory);

    titleSlideItemComp = <NfxTitleSlideItemComponent>componentRef.instance;

    if (fadeEffect) {
      this.renderer.addClass(titleSlideItemComp.elementRef.nativeElement, 'nfx-effect-fadein');
    }

    titleSlideItemComp.genreId = this.titleSlideInfo.genreId;
    titleSlideItemComp.setBigTitle(false, this.showBigTitleUI);
    titleSlideItemComp.onSetTitleSlideItem(this.isValidItem(itemIndex) ? titleSlideList[itemIndex] : null);
    titleSlideItemComp.isVisibleItemCollapse = this.showItemCollapseUI;
    titleSlideItemComp.hostViewRef = componentRef.hostView;
    titleSlideItemComp.itemIndex = itemIndex;
    titleSlideItemComp.currentPage = this.currentPage;
    titleSlideItemComp.mouseEnterItem.subscribe(
      (titleSlideItemComponent) => { this.onMouseEnterItem(titleSlideItemComponent); }
    );
    titleSlideItemComp.clickItemCollapse.subscribe(
      (slideItemIndex) => { this.onClickItemCollapse(slideItemIndex); }
    );
    titleSlideItemComp.clickMyList.subscribe(
      (slideItemIndex) => { this.onClickMylist(slideItemIndex); }
    );

    this.lastSlideItem = titleSlideItemComp;
  }

  private isValidItem(index: number): boolean {
    const titleSlideList: TitleSlideItem[] =
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];

    if (titleSlideList &&
      titleSlideList[index] !== undefined &&
      titleSlideList[index] != null) {
      return true;
    }

    return false;
  }

  private hoverSlideItem(titleSlideItemComp: NfxTitleSlideItemComponent) {
    const listIndex = this.titleSlideItemDirective.viewContainerRef.indexOf(titleSlideItemComp.hostViewRef);
    const listLen = this.titleSlideItemDirective.viewContainerRef.length;

    if (this.isNavEffect) {
      return;
    }

    if (this.tmItemHover) {
      this.window.clearTimeout(this.tmItemHover);
    }

    this.tmItemHover = this.window.setTimeout(
      () => {
        if (listIndex === 1) {
          this.alignItems(true, false);
        } else if (listIndex === listLen - 2) {
          this.alignItems(false, true);
        } else {
          this.alignItems(false, false);
        }
      },
      this.tmItemHover ? this.titleSlideItemDirective.hoverDelay : 0
    );
  }

  private alignItems(left: boolean, right: boolean) {
    if (this.isLeftAlign === left && this.isRightAlign === right) {
      return;
    }

    this.isLeftAlign = left;
    this.isRightAlign = right;

    if (left === true && right === false) {
      this.renderer.setStyle(this.titleSliderPanel.nativeElement, 'align-items', 'flex-start');
    } else if (left === false && right === true) {
      this.renderer.setStyle(this.titleSliderPanel.nativeElement, 'align-items', 'flex-end');
    } else {
      this.renderer.setStyle(this.titleSliderPanel.nativeElement, 'align-items', 'center');
    }
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }

  onMouseEnterItem(titleSlideItemComp: NfxTitleSlideItemComponent) {
    this.hoverSlideItem(titleSlideItemComp);
  }

  private showItemCollapse(show: boolean) {
    this.showItemCollapseUI = show;

    if (!show) {
      if (this.tmOverviewImg) {
        this.window.clearInterval(this.tmOverviewImg);
      }
    }
  }

  private setSelectedItem(itemIndex: number) {
    this.selectedItemIndex = itemIndex;
    this.selectedSlideItem =
      this.titleSlideInfo.titleSlideList[this.selectedItemIndex] as TitleSlideItem;
    
    if (this.selectedSlideItem.runningTime > 0) {
      this.overviewRunningTime = 
      `${Math.floor(this.selectedSlideItem.runningTime / 60)}h ${this.selectedSlideItem.runningTime % 60}m`;      
    } else {
      if (this.selectedSlideItem.seasonNum > 1) {
        this.overviewRunningTime = `${this.selectedSlideItem.seasonNum} Seasons`;
      } else {
        this.overviewRunningTime = `${this.selectedSlideItem.seasonNum} Season`;
      }
    }

    this.updateMyListButton(itemIndex);
    
    this.initOverviewImage();
  }

  private updateMyListButton(itemIndex: number) {
    if (this.profileInfoService.account === undefined ||
      this.profileInfoService.account === null) {
        this.isMyList = false;
      }

    const slideItemList = this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    const slideItem = slideItemList[itemIndex];

    if (slideItem) {
      this.isMyList = this.myListService
      .isMyList(
        this.profileInfoService.account._id,
        slideItem._id
      );
    }
  }

  private initOverviewImage() {
    if (
      this.selectedSlideItem === undefined ||
      this.selectedSlideItem == null
    ) {
      this.selectedSlideItem = null;
      return;
    }

    this.currentImgOverview = 0;
    this.showFrontImgOverview = true;

    while (this.arrImgOverview.length > 0) {
      this.arrImgOverview.pop();
    }

    for (let imgOverview of this.selectedSlideItem.imgOverview) {
      this.arrImgOverview.push(imgOverview);
    }
    
    this.imgOverviewFront = this.arrImgOverview[this.currentImgOverview];
    this.imgOverviewBehind = this.arrImgOverview[this.currentImgOverview + 1];

    if (this.tmOverviewImg) {
      this.window.clearInterval(this.tmOverviewImg);
    }

    this.tmOverviewImg = this.window.setInterval(
      () => { this.flipOverviewImg(); }, 2000);
  }

  private flipOverviewImg() {
    this.showFrontImgOverview = !this.showFrontImgOverview;

    if (this.showFrontImgOverview) {
      if (this.tmLoadOverviewImg) {
        this.window.clearTimeout(this.tmLoadOverviewImg);
      }

      this.tmLoadOverviewImg = this.window.setTimeout(
        () => {
          let behindRotator = this.currentImgOverview + 1;
          if (behindRotator >= this.arrImgOverview.length) {
            behindRotator = 0;
          }
          this.imgOverviewBehind = this.arrImgOverview[behindRotator];
        },
        1500
      );
    } else {
      if (this.tmLoadOverviewImg) {
        this.window.clearTimeout(this.tmLoadOverviewImg);
      }

      this.tmLoadOverviewImg = this.window.setTimeout(
        () => {
          this.currentImgOverview += 2;
          if (this.currentImgOverview >= this.arrImgOverview.length) {
            this.currentImgOverview = Math.abs(this.arrImgOverview.length - this.currentImgOverview);
          }

          this.imgOverviewFront = this.arrImgOverview[this.currentImgOverview];
        },
        1500
      );
    }
  }

  resetTitleSlider(titleSlideInfo: TitleSlideInfo) {
    this.currentNumOfSlots = 0;
    this.updateTitleSlider();
  }

  onClickItemCollapse(itemIndex: number) {
    this.selectedItemIndex = itemIndex;
    this.titleSilderService.setItemCollapseEvent(
      this.titleSlideInfo.genreId,
      this.selectedItemIndex,
      true,
      this.currentPage);

    this.showItemCollapse(true);
  }

  onCloseItemCollapse() {
    this.titleSilderService.setItemCollapseEvent(
      this.titleSlideInfo.genreId,
      this.selectedItemIndex,
      false,
      this.currentPage);

    this.showItemCollapse(false);
  }

  onMouseEnterPlay() {
    this.isMouseEnterPlay = true;
  }

  onMouseLeavePlay() {
    this.isMouseEnterPlay = false;
  }

  onClickMylist(itemIndex: number = null) {
    if (itemIndex === undefined || itemIndex === null) {
      itemIndex = this.selectedItemIndex;
    }

    this.myListItemIndex = itemIndex;
    this.clickMyList.emit(itemIndex);
  }

  onClickPlay() {}
}
