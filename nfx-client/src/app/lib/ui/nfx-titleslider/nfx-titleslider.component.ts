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
  ComponentRef
} from '@angular/core';

import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';

import { windowRefProvider, WINDOW_REF } from '../../../service/window/window.service';
import { NfxTitleSlideItemDirective } from './nfx-titleslideitem.directive';
import { NfxTitleSlideItemComponent } from './nfx-titleslideitem.component';
import { ItemCollapseEvent } from '../../../service/title/title-slide.event';
import { ItemSelectedEvent } from '../../../service/title/title-slide.event';
import { TitleSlideService } from '../../../service/title/title-slide.service';
import { ProfileInfoServcie } from '../../../service/profile/profileinfo.service';
import { MyListService } from '../../../service/title/mylist.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'nfx-titleslider',
  templateUrl: './nfx-titleslider.component.html',
  styleUrls: ['./nfx-titleslider.component.scss'],
  providers: [ windowRefProvider ]
})
export class NfxTitleSliderComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() genreId: string = '';

  @ViewChild(NfxTitleSlideItemDirective) titleSlideItemDirective: NfxTitleSlideItemDirective;
  @ViewChild('titleSliderPanel', {read: ElementRef}) titleSliderPanel: ElementRef;

  public titleSlideInfo: TitleSlideInfo = null;
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
  private currentPage = 0;
  private tmNavEffect: number = null;
  private tmBigTitleEffect: number = null;
  private tmResize: number = null;
  private selectedItemIndex = -1;
  private tmAutoSelectItem: number = null;
  private currentImgOverview = 0;
  private tmOverviewImg: number = null;
  private tmLoadOverviewImg: number = null;
  private subsTitleSlideInfo: Subscription = null;
  private subsItemCollapseEvent: Subscription = null;
  private subsItemSelectedEvent: Subscription = null;
  private subsUpdateMyList: Subscription = null;
  private subsDeleteMyList: Subscription = null;
  private myListItemIndex: number = -1;
  private tmUpdateMyListButton: number = null;
      

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private renderer: Renderer2,
    private titleSilderService: TitleSlideService,
    private profileInfoService: ProfileInfoServcie,
    private myListService: MyListService,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  ngOnInit() {
    this.registerTitleSlideInfoCallback();
    this.registerItemCollapseEvent();
    this.registerItemSelectedEvent();
    this.registerUpdateMyListCallback();
    this.registerDeleteMyListCallback();
  }

  ngAfterViewInit() {
    this.titleSilderService.reqTitleSlideInfo(this.genreId);
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

    if (this.subsTitleSlideInfo) {
      this.subsTitleSlideInfo.unsubscribe();
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

    if (this.tmUpdateMyListButton) {
      this.window.clearTimeout(this.tmUpdateMyListButton);
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
      100
    );
  }

  private registerTitleSlideInfoCallback() {
    this.subsTitleSlideInfo = 
    this.titleSilderService.resTitleSlideInfo$
      .filter(titleSlideInfo => (
        titleSlideInfo &&
        titleSlideInfo.genreId === this.genreId
        )
      )
      .subscribe(
        titleSlideInfo => {
          this.onResTitleSlideInfo(titleSlideInfo);
        }
      );
  }

  private onResTitleSlideInfo(titleSlideInfo: TitleSlideInfo) {
    this.initTitleSlider(titleSlideInfo);
  }

  private registerItemCollapseEvent() {
    this.subsItemCollapseEvent = 
    this.titleSilderService.resItemCollpaseEvent$
      .filter(itemCollapseEvent => (
        (itemCollapseEvent.genreId !== this.genreId) &&
        itemCollapseEvent.isOpened
        )
      )
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
        false);

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
    .subscribe(
      titleSlideInfo => {
        this.onResUpdateMyList(titleSlideInfo);
      }
    );
  }

  private onResUpdateMyList(titleSlideInfo: TitleSlideInfo) {
    this.titleSlideInfo = titleSlideInfo;
    if (this.titleSlideInfo.genreId === this.profileInfoService.account._id) {
      this.titleSlideInfo.titleSlideList.reverse();
    }
    this.resetTitleSlider(titleSlideInfo);
  }

  private registerDeleteMyListCallback() {
    this.subsDeleteMyList = 
    this.myListService.resDeleteMyList$
    .pipe(
      tap(() => {
        if (this.myListItemIndex >= 0) {
          if (this.tmUpdateMyListButton) {
            this.window.clearTimeout(this.tmUpdateMyListButton);
          }
          this.tmUpdateMyListButton = this.window.setTimeout(() => {
            this.updateMyListButton(this.myListItemIndex);
            this.myListItemIndex = -1;
          }, 100);            
        }
      })
    )
    .filter(titleSlideInfo => (
      titleSlideInfo &&
      titleSlideInfo.genreId === this.genreId
      )
    )
    .subscribe(
      titleSlideInfo => {
        this.onResDeleteMyList(titleSlideInfo);
      }
    );
  }

  private onResDeleteMyList(titleSlideInfo: TitleSlideInfo) {
    this.titleSlideInfo = titleSlideInfo;
    if (this.titleSlideInfo.genreId === this.profileInfoService.account._id) {
      this.titleSlideInfo.titleSlideList.reverse();
    }
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
    this.titleSlideItemDirective.viewContainerRef.clear();
    
    if (titleSlideInfo === undefined || titleSlideInfo === null) {
      return;
    }

    this.titleSlideInfo = titleSlideInfo;
    if (this.titleSlideInfo.genreId === this.profileInfoService.account._id) {
      this.titleSlideInfo.titleSlideList.reverse();
    }
    this.showBigTitleUI = titleSlideInfo.isBigTitle;
    this.titleSlideItemCompFactory = this.componentFactoryResolver.resolveComponentFactory(NfxTitleSlideItemComponent);
    const slideItemCompRef = this.titleSlideItemDirective.viewContainerRef.createComponent(this.titleSlideItemCompFactory);
    this.lastSlideItem = <NfxTitleSlideItemComponent>slideItemCompRef.instance;

    this.updateTitleSlider(false, true);
  }

  private updateTitleSlider(
    forceUpdate: boolean = false,
    fadeEffect: boolean = false,
    reverseInsert: boolean = false) {
    const numOfSlots: number = this.getNumOfSlot();

    if (numOfSlots === this.currentNumOfSlots && !forceUpdate) {
      return;
    }

    const arrItem: number[] = this.createNavPage(numOfSlots, forceUpdate);
    this.makeNavEffect(forceUpdate, arrItem, fadeEffect, reverseInsert);
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
          this.titleSilderService.setItemSelectedEvent(this.genreId, arrItem[1]);
        }
      },
      500
    );
  }

  private createNavPage(numOfSlots: number, forceUpdate: boolean): number[] {
    this.currentNumOfSlots = numOfSlots;
    const titleSlideList: TitleSlideItem[] = 
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    
    const arrItem = new Array();

    if (numOfSlots < 1 || titleSlideList.length <= 0) {
      arrItem.push(-1);
      return arrItem;
    }

    const isInit = (this.currentStartIndex == null) ? true : false;

    let leftHiddenIndex = -1;
    let startIndex = -1;
    let endIndex = -1;
    let rightHiddenIndex = -1;

    if (isInit) {
      startIndex = 0;
      leftHiddenIndex = -1;
    } else {
      startIndex = this.currentStartIndex;

      if (!forceUpdate) {
        startIndex = Math.floor(startIndex / numOfSlots) * numOfSlots;
      }
    }

    endIndex = startIndex + numOfSlots - 1;

    if (!this.isValidItem(startIndex) || !this.isValidItem(endIndex)) {
      if (titleSlideList.length <= numOfSlots) {
        startIndex = 0;
        endIndex = titleSlideList.length - 1;
      } else {
        if (this.isValidItem(startIndex)) {
          endIndex = titleSlideList.length - 1;
          startIndex = endIndex - numOfSlots + 1;
        } else if (this.isValidItem(endIndex)) {
          startIndex = 0;
          endIndex = numOfSlots - 1;
        } else {
          if (startIndex >= 0) {
            startIndex = 0;
            endIndex = numOfSlots - 1;
          } else {
            endIndex = titleSlideList.length - 1;
            startIndex = endIndex - numOfSlots + 1;
          }
        }
      }
    }

    this.isVisibleNavLeft = false;
    this.isVisibleNavRight = false;

    if (titleSlideList.length <= numOfSlots) {
      leftHiddenIndex = -1;
      rightHiddenIndex = -1;
    } else {
      if (isInit) {
        leftHiddenIndex = -1;
      } else {
        if (startIndex === 0) {
          leftHiddenIndex = titleSlideList.length - 1;
          this.isVisibleNavLeft = true;
        } else {
          leftHiddenIndex = startIndex - 1;
          this.isVisibleNavLeft = true;
        }
      }

      if (endIndex === titleSlideList.length - 1) {
        rightHiddenIndex = 0;
        this.isVisibleNavRight = true;
      } else {
        rightHiddenIndex = endIndex + 1;
        this.isVisibleNavRight = true;
      }
    }

    if (!isInit) {
      this.currentStartIndex = startIndex;
    }

    arrItem.push(leftHiddenIndex);

    for (let i = 0; i < numOfSlots; i++) {
      arrItem.push(startIndex + i);
    }

    arrItem.push(rightHiddenIndex);


    this.numOfPages = Math.floor(titleSlideList.length / numOfSlots);
    this.numOfPages += (Math.ceil(titleSlideList.length % numOfSlots) > 0) ? 1 : 0;

    this.currentPage = Math.floor(arrItem[1] / numOfSlots);
    this.currentPage += (Math.ceil(arrItem[1] % numOfSlots) > 0) ? 1 : 0;

    while (this.arrPage.length > 0) {
      this.arrPage.pop();
    }

    for (let i = 0; i < this.numOfPages; i++) {
      this.arrPage.push((i === this.currentPage) ? true : false);
    }

    return arrItem;
  }

  private makeNavEffect(
    forceUpdate: boolean,
    arrItem: number[],
    fadeEffect: boolean,
    reverseInsert: boolean) {
    if (arrItem === undefined || arrItem == null) {
      return;
    }

    const viewContainerRef = this.titleSlideItemDirective.viewContainerRef;

    if (forceUpdate) {
      const numOfEffects = reverseInsert ?
        arrItem.length - this.arrItem.lastIndexOf(arrItem[arrItem.length - 1]) - 1 :
        this.arrItem.indexOf(arrItem[0]);

      const startIndex = reverseInsert ?
        numOfEffects - 1 : arrItem.length - numOfEffects;

      for (let i = 0; i < numOfEffects; i++) {
        if (reverseInsert) {
          this.createSlideItem(arrItem[startIndex - i], fadeEffect, reverseInsert);
        } else {
          this.createSlideItem(arrItem[startIndex + i], fadeEffect, reverseInsert);
        }
      }

      this.isNavEffect = true;

      this.renderer.setStyle(
        this.titleSliderPanel.nativeElement,
        'left',
        reverseInsert ?
        `${this.lastSlideItem.getComputedElementWidth() * numOfEffects}px` :
        `-${this.lastSlideItem.getComputedElementWidth() * numOfEffects}px`);

      this.tmNavEffect = this.window.setTimeout(
        () => {
          for (let i = 0; i < numOfEffects; i++) {
            if (reverseInsert) {
              viewContainerRef.remove(viewContainerRef.length);
            } else {
              viewContainerRef.remove(0);
            }
          }

          this.renderer.setStyle(
            this.titleSliderPanel.nativeElement,
            'left', '0');

          if (reverseInsert) {
            this.alignItems(true, false);
          } else {
            this.alignItems(false, true);
          }

          this.isNavEffect = false;
        },
        this.titleSlideItemDirective.navEffectDelay + 50
      );
    } else {
      viewContainerRef.clear();

      for (let i = 0; i < arrItem.length; i++) {
        this.createSlideItem(arrItem[i], fadeEffect, reverseInsert);
      }
    }
  }

  private createSlideItem(
    itemIndex: number,
    fadeEffect: boolean,
    reverseInsert: boolean) {
    const titleSlideList: TitleSlideItem[] =
      this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    const viewContainerRef = this.titleSlideItemDirective.viewContainerRef;

    let titleSlideItemComp: NfxTitleSlideItemComponent = null;

    let componentRef = null;

    if (reverseInsert) {
      componentRef = viewContainerRef.createComponent(this.titleSlideItemCompFactory, 0);
    } else {
      componentRef = viewContainerRef.createComponent(this.titleSlideItemCompFactory);
    }

    titleSlideItemComp = <NfxTitleSlideItemComponent>componentRef.instance;

    if (fadeEffect) {
      this.renderer.addClass(titleSlideItemComp.elementRef.nativeElement, 'nfx-effect-fadein');
    }

    titleSlideItemComp.genreId = this.genreId;
    titleSlideItemComp.setBigTitle(this.titleSlideInfo.isBigTitle, this.showBigTitleUI);
    titleSlideItemComp.onSetTitleSlideItem(this.isValidItem(itemIndex) ? titleSlideList[itemIndex] : null);
    titleSlideItemComp.isVisibleItemCollapse = this.showItemCollapseUI;
    titleSlideItemComp.hostViewRef = componentRef.hostView;
    titleSlideItemComp.itemIndex = itemIndex;
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

    if (titleSlideList[index] !== undefined &&
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

  onMouseEnterSliderNavBtn() {
    this.isSliderNavBtnHover = true;
  }

  onMouseLeaveSliderNavBtn() {
    this.isSliderNavBtnHover = false;
  }

  onClickNavLeft() {
    if (this.isNavEffect || !this.isVisibleNavLeft) {
      return;
    }

    this.alignItems(false, true);

    if (this.currentStartIndex == null) {
      this.currentStartIndex = 0;
    }

    this.currentStartIndex -= this.currentNumOfSlots;
    this.updateTitleSlider(true, false, true);
  }

  onClickNavRight() {
    if (this.isNavEffect || !this.isVisibleNavRight) {
      return;
    }

    this.alignItems(true, false);

    if (this.currentStartIndex == null) {
      this.currentStartIndex = 0;
    }

    this.currentStartIndex += this.currentNumOfSlots;
    this.updateTitleSlider(true, false, false);
  }

  onMouseEnterItem(titleSlideItemComp: NfxTitleSlideItemComponent) {
    this.hoverSlideItem(titleSlideItemComp);
  }

  private showItemCollapse(show: boolean) {
    if (this.titleSlideInfo.isBigTitle) {
      if (this.tmBigTitleEffect) {
        this.window.clearTimeout(this.tmBigTitleEffect);
      }
      this.bigTitleEffect = true;
      this.showBigTitleUI = !show;
      this.tmBigTitleEffect = this.window.setTimeout(
        () => { this.bigTitleEffect = false; },
        500
      );
    }

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
      this.genreId,
      this.selectedItemIndex,
      true);

    this.showItemCollapse(true);
  }

  onCloseItemCollapse() {
    this.titleSilderService.setItemCollapseEvent(
      this.genreId,
      this.selectedItemIndex,
      false);

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
    let titleSlideInfo$: Observable<TitleSlideInfo> = null;
    const titleSlideList = this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    this.isMyList = this.myListService
    .isMyList(
      this.profileInfoService.account._id,
      titleSlideList[itemIndex]._id
    )
    
    if (this.isMyList) {
      this.myListService
      .reqDeleteMyList(titleSlideList[itemIndex]._id);
    } else {
      this.myListService
      .reqUpdateMyList(titleSlideList[itemIndex]._id);
    }
  }

  onClickPlay() {}

  onClickTitle() {}
}
