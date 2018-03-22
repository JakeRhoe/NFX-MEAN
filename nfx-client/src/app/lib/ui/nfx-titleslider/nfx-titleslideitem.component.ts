import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  Output,
  EventEmitter,
  ElementRef,
  HostListener,
  ViewRef
} from '@angular/core';

import { windowRefProvider, WINDOW_REF } from '../../../service/window/window.service';
import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';
import { ItemCollapseEvent } from '../../../service/title/title-slide.event';
import { ItemSelectedEvent } from '../../../service/title/title-slide.event';
import { ProfileInfoServcie } from '../../../service/profile/profileinfo.service';
import { TitleSlideService } from '../../../service/title/title-slide.service';
import { MyListService } from '../../../service/title/mylist.service';
import { Observable } from 'rxjs/Observable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';


@Component({
  templateUrl: './nfx-titleslideitem.component.html',
  styleUrls: ['./nfx-titleslideitem.component.scss'],
  providers: [ windowRefProvider ]
})
export class NfxTitleSlideItemComponent implements OnInit, OnDestroy {
  public titleSlideItem: TitleSlideItem = null;
  public titleText: string = '';
  public runningTime: string = null;
  public hostViewRef: ViewRef = null;
  public genreId: string = null;
  public itemIndex: number = null;
  public isResizing = true;
  public isSetTitleSlideItem = false;
  public isLoadedTitleImage = false;
  public isMouseEnterItem = false;
  public isBigTitle = false;
  public showBigTitleUI = false;
  public isMouseEnterPlay = false;
  public imgRotatorFront: string = null;
  public imgRotatorBehind: string = null;
  public arrImgRotator: string[] = new Array();
  public showFrontImgRotator = true;
  public currentImgRotator = 0;
  public isVisibleItemCollapse = false;
  public isSelectedItem = false;
  public isShowRotatorPanel = true;
  public currentPage = -1;
  public isMyList:boolean = false;

  private tmResize: number = null;
  private tmRotator: number = null;
  private tmLoadRotator: number = null;
  private tmMouseEnter: number = null;
  private tmScrollTop: number = null;
  private subsUpdateMyList: Subscription = null;
  private subsDeleteMyList: Subscription = null;


  @Output() mouseEnterItem = new EventEmitter<NfxTitleSlideItemComponent>();
  @Output() clickItemCollapse = new EventEmitter<number>();
  @Output() clickMyList = new EventEmitter<number>();

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    public elementRef: ElementRef,
    private profileInfoService: ProfileInfoServcie,
    private titleSilderService: TitleSlideService,
    private myListService: MyListService
  ) {}

  ngOnInit() {
    this.registerItemCollapseEvent();
    this.registerItemSelectedEvent();

    this.tmResize = this.window.setTimeout(
      () => {
        this.isResizing = false;
        this.isShowRotatorPanel = true;
      },
      200);
  }

  ngOnDestroy() {
    if (this.tmResize) {
      this.window.clearTimeout(this.tmResize);
    }

    if (this.tmRotator) {
      this.window.clearInterval(this.tmRotator);
    }

    if (this.tmLoadRotator) {
      this.window.clearTimeout(this.tmLoadRotator);
    }

    if (this.tmMouseEnter) {
      this.window.clearTimeout(this.tmMouseEnter);
    }

    if (this.tmScrollTop) {
      this.window.clearTimeout(this.tmScrollTop);
    }

    this.unRegisterUpdateMyListCallback();
    this.unRegisterDeleteMyListCallback();
  }

  @HostListener('window:resize', ['$event']) onWindowResize(event: Event) {
    if (this.tmResize) {
      this.window.clearTimeout(this.tmResize);
    }

    this.isResizing = true;
    this.isShowRotatorPanel = false;

    this.tmResize = this.window.setTimeout(
      () => {
        this.isResizing = false;
        this.isShowRotatorPanel = true;
      },
      200);
  }

  private registerUpdateMyListCallback() {
    this.subsUpdateMyList = 
    this.myListService.resUpdateMyList$
    .subscribe((titleSlideInfo) => {
      this.onResUpdateMyList(titleSlideInfo);
    });
  }

  private unRegisterUpdateMyListCallback() {
    if (this.subsUpdateMyList) {
      this.subsUpdateMyList.unsubscribe();
    }
  }

  private onResUpdateMyList(titleSlideInfo: TitleSlideInfo) {
    this.updateMyListButton();
    this.unRegisterUpdateMyListCallback();
  }

  private registerDeleteMyListCallback() {
    this.subsDeleteMyList = 
    this.myListService.resDeleteMyList$
    .subscribe((titleSlideInfo) => {
      this.onResDeleteMyList(titleSlideInfo);
    });
  }

  private unRegisterDeleteMyListCallback() {
    if (this.subsDeleteMyList) {
      this.subsDeleteMyList.unsubscribe();
    }
  }

  private onResDeleteMyList(titleSlideInfo: TitleSlideInfo) {
    this.updateMyListButton();
    this.unRegisterDeleteMyListCallback();
  }

  private initImgRotator(titleSlideItem: TitleSlideItem) {
    for (let imgRotator of this.isBigTitle ? titleSlideItem.imgBigRotator : titleSlideItem.imgRotator) {
      this.arrImgRotator.push(imgRotator);
    }

    this.imgRotatorFront = this.arrImgRotator[this.currentImgRotator];
    this.imgRotatorBehind = this.arrImgRotator[this.currentImgRotator + 1];
  }

  private flipImgRotator() {
    this.showFrontImgRotator = !this.showFrontImgRotator;

    if (this.showFrontImgRotator) {
      if (this.tmLoadRotator) {
        this.window.clearTimeout(this.tmLoadRotator);
      }

      this.tmLoadRotator = this.window.setTimeout(
        () => {
          let behindRotator = this.currentImgRotator + 1;
          if (behindRotator >= this.arrImgRotator.length) {
            behindRotator = 0;
          }
          this.imgRotatorBehind = this.arrImgRotator[behindRotator];
        },
        1500
      );
    } else {
      if (this.tmLoadRotator) {
        this.window.clearTimeout(this.tmLoadRotator);
      }

      this.tmLoadRotator = this.window.setTimeout(
        () => {
          this.currentImgRotator += 2;
          if (this.currentImgRotator >= this.arrImgRotator.length) {
            this.currentImgRotator = Math.abs(this.arrImgRotator.length - this.currentImgRotator);
          }

          this.imgRotatorFront = this.arrImgRotator[this.currentImgRotator];
        },
        1500
      );
    }
  }

  private registerItemCollapseEvent() {
    this.titleSilderService.resItemCollpaseEvent$
      .subscribe(itemCollapseEvent => {
        this.onResItemCollapseEvent(itemCollapseEvent);
      }
    );
  }

  private onResItemCollapseEvent(itemCollapseEvent: ItemCollapseEvent) {
    if (itemCollapseEvent.isOpened) {
      if (
        itemCollapseEvent.genreId === this.genreId &&
        itemCollapseEvent.currentPage === this.currentPage
      ) {
        this.isVisibleItemCollapse = true;

        if (this.isBigTitle) {
          this.showBigTitleUI = false;
        }

        if (itemCollapseEvent.itemIndex === this.itemIndex) {
          this.titleSilderService.setItemSelectedEvent(
            this.genreId,
            this.itemIndex,
            this.currentPage
          );
        }
      }
    } else {
      this.isVisibleItemCollapse = false;

      if (this.isBigTitle) {
        this.showBigTitleUI = true;
      }

      this.isSelectedItem = false;
    }
  }

  private registerItemSelectedEvent() {
    this.titleSilderService.resItemSelectedEvent$
      .subscribe(itemCollapseEvent => {
        this.onResItemSelectedEvent(itemCollapseEvent);
      }
    );
  }

  private onResItemSelectedEvent(itemSelectedEvent: ItemSelectedEvent) {
    if (
      itemSelectedEvent.genreId === this.genreId &&
      itemSelectedEvent.currentPage === this.currentPage &&
      itemSelectedEvent.itemIndex === this.itemIndex &&
      this.isVisibleItemCollapse
    ) {
      this.isSelectedItem = true;
    } else {
      this.isSelectedItem = false;
    }
  }

  private updateMyListButton() {
    if (this.profileInfoService.account === undefined ||
      this.profileInfoService.account === null ||
      this.titleSlideItem === undefined ||
      this.titleSlideItem === null) {
        this.isMyList = false;
      }

    this.isMyList = this.myListService.isMyList(
      this.profileInfoService.account._id,
      this.titleSlideItem._id
    );
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }

  getComputedElementWidth(): number {
    return this.elementRef.nativeElement.clientWidth;
  }

  onSetTitleSlideItem(titleSlideItem: TitleSlideItem) {
    if (titleSlideItem == null) {
      return;
    }

    this.isSetTitleSlideItem = true;
    this.isLoadedTitleImage = true;

    this.titleSlideItem = titleSlideItem;
    this.titleText = titleSlideItem.title;

    if (this.titleText.length > 20) {
      this.titleText = this.titleText.substr(0, 17) + '...';
    }

    this.initImgRotator(titleSlideItem);
    
    if (titleSlideItem.runningTime > 0) {
      this.runningTime = 
      `${Math.floor(titleSlideItem.runningTime / 60)}h ${titleSlideItem.runningTime % 60}m`;      
    } else {
      if (titleSlideItem.seasonNum > 1) {
        this.runningTime = `${titleSlideItem.seasonNum} Seasons`;
      } else {
        this.runningTime = `${titleSlideItem.seasonNum} Season`;
      }
    }
  }

  onLoadedTitleImage() {
    this.isLoadedTitleImage = true;
  }

  setBigTitle(isBigTitle: boolean, showBigTitleUI: boolean) {
    this.isBigTitle = isBigTitle;
    this.showBigTitleUI = showBigTitleUI;
  }

  onMouseEnterItem() {
    if (!this.isLoadedTitleImage) {
      return;
    }

    if (this.isResizing) {
      return;
    }

    this.mouseEnterItem.emit(this);

    this.registerUpdateMyListCallback();
    this.registerDeleteMyListCallback();
    this.updateMyListButton();

    if (this.isVisibleItemCollapse) {
      if (this.tmMouseEnter) {
        this.window.clearTimeout(this.tmMouseEnter);
      }

      this.tmMouseEnter = this.window.setTimeout(
        () => {
          this.titleSilderService.setItemSelectedEvent(
            this.genreId,
            this.itemIndex,
            this.currentPage
          );
        }, 500);
      return;
    }

    this.isMouseEnterItem = true;

    if (this.tmRotator) {
      this.window.clearInterval(this.tmRotator);
    }

    this.tmRotator = this.window.setInterval(
      () => { this.flipImgRotator(); }, 2000);
  }

  onMouseLeaveItem() {
    this.isMouseEnterItem = false;
    this.unRegisterUpdateMyListCallback();
    this.unRegisterDeleteMyListCallback();

    if (this.isVisibleItemCollapse) {
      if (this.tmMouseEnter) {
        this.window.clearTimeout(this.tmMouseEnter);
      }

      return;
    }

    if (this.tmRotator) {
      this.window.clearInterval(this.tmRotator);
    }
  }

  onMouseEnterPlay() {
    this.isMouseEnterPlay = true;
  }

  onMouseLeavePlay() {
    this.isMouseEnterPlay = false;
  }

  onClickPlay() {}

  onClickMylist() {
    this.clickMyList.emit(this.itemIndex);
  }

  onClickItemCollapse() {
    this.onMouseLeaveItem();
    this.clickItemCollapse.emit(this.itemIndex);

    if (this.tmScrollTop) {
      this.window.clearTimeout(this.tmScrollTop);
    }

    this.tmScrollTop = this.window.setTimeout(
      () => {
        const elTop: number = this.elementRef.nativeElement.getBoundingClientRect().y;
        const elHeight: number = this.elementRef.nativeElement.clientHeight;
        this.window.scrollBy(0, elTop - elHeight * 2);
      },
      600
    );
  }
}
