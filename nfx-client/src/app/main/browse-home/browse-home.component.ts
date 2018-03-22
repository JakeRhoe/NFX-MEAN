import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  Inject,
  HostListener
} from '@angular/core';

import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';

import { windowRefProvider, WINDOW_REF } from '../../service/window/window.service';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';
import { HomeTitleService } from '../../service/title/home-title.service';
import { TitleSlideService } from '../../service/title/title-slide.service';
import { MyListService } from '../../service/title/mylist.service';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'nfx-browse-home',
  templateUrl: './browse-home.component.html',
  styleUrls: ['./browse-home.component.scss'],
  providers: [ windowRefProvider ]
})
export class BrowseHomeComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('videoPlayer', {read: ElementRef}) videoPlayer: ElementRef;

  public isMuted = true;
  public myListId: string = '';
  public homeTitleItem: TitleSlideItem = null;
  public isMyList: boolean = false;

  private isEndedVC = true;
  private isPausedVC = false;
  private tmVideoPlay: number = null;
  private tmPauseVideo: number = null;
  private subsUpdateMyList: Subscription = null;
  private subsDeleteMyList: Subscription = null;
  private subsSetMyList: Subscription = null;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private profileInfoService: ProfileInfoServcie,
    private homeTitleService: HomeTitleService,
    private titleSilderService: TitleSlideService,
    private myListService: MyListService
  ) {}

  ngOnInit() {
    this.myListId = this.profileInfoService.account._id;

    this.registerUpdateMyListCallback();
    this.registerDeleteMyListCallback();
  }

  ngAfterViewInit() {
    this.homeTitleService.getHomeTitle()
    .subscribe((titleSlideItem) => {
      this.homeTitleItem = titleSlideItem;
      this.registerSetMyListCallback();
      this.updateMyListButton();

      this.tmVideoPlay = this.window.setTimeout(
        () => {
          if (this.videoPlayer && this.videoPlayer.nativeElement) {
            this.videoPlayer.nativeElement.play();
            this.isEndedVC = false;
          } else {
            this.window.clearTimeout(this.tmVideoPlay);
          }          
        },
        2000
      );
    });
  }

  ngOnDestroy() {
    if (this.tmVideoPlay) {
      this.window.clearTimeout(this.tmVideoPlay);
    }

    if (this.tmPauseVideo) {
      this.window.clearTimeout(this.tmPauseVideo);
    }

    if (this.subsUpdateMyList) {
      this.subsUpdateMyList.unsubscribe();
    }

    if (this.subsDeleteMyList) {
      this.subsDeleteMyList.unsubscribe();
    }

    if (this.subsSetMyList) {
      this.subsSetMyList.unsubscribe();
    }
  }

  @HostListener('window:scroll', ['$event']) onWindowScroll(event: Event) {
    this.pauseVideo();
  }

  private pauseVideo() {
    if (!this.isEndedVC) {
      const elTop: number = this.videoPlayer.nativeElement.getBoundingClientRect().y;
      const elHeight: number = this.videoPlayer.nativeElement.getBoundingClientRect().height;

      if (
        elTop < -(elHeight / 2) &&
        !this.isPausedVC
      ) {
        this.videoPlayer.nativeElement.pause();
        this.isPausedVC = true;
      }

      if (
        elTop > -(elHeight / 2) &&
        this.isPausedVC
      ) {
        this.videoPlayer.nativeElement.play();
        this.isPausedVC = false;
      }
    }
  }

  private registerUpdateMyListCallback() {
    this.subsUpdateMyList = 
    this.myListService.resUpdateMyList$
    .subscribe(
      titleSlideInfo => {
        this.onResUpdateMyList(titleSlideInfo);
      }
    );
  }

  private onResUpdateMyList(titleSlideInfo: TitleSlideInfo) {
    if (titleSlideInfo === undefined || titleSlideInfo == null ||
      titleSlideInfo.titleSlideList === undefined || 
      titleSlideInfo.titleSlideList == null) {
      return;
    }

    const slideList: TitleSlideItem[] = titleSlideInfo.titleSlideList as TitleSlideItem[];

    for (let i = 0; i < slideList.length; i++) {
      if (this.homeTitleItem._id === slideList[i]._id) {
        this.isMyList = true;
        return;
      }
    }

    this.isMyList = false;
  }

  private registerDeleteMyListCallback() {
    this.subsDeleteMyList = 
    this.myListService.resDeleteMyList$
    .subscribe(
      titleSlideInfo => {
        this.onResDeleteMyList(titleSlideInfo);
      }
    );
  }

  private onResDeleteMyList(titleSlideInfo: TitleSlideInfo) {
    if (titleSlideInfo === undefined || titleSlideInfo == null ||
      titleSlideInfo.titleSlideList === undefined || 
      titleSlideInfo.titleSlideList == null) {
      return;
    }

    const slideList: TitleSlideItem[] = titleSlideInfo.titleSlideList as TitleSlideItem[];

    for (let i = 0; i < slideList.length; i++) {
      if (this.homeTitleItem._id === slideList[i]._id) {
        return;
      }
    }

    this.isMyList = false;
  }

  private registerSetMyListCallback() {
    this.subsSetMyList = 
    this.myListService.resSetMyListEvent$
    .subscribe(
      titleSlideInfo => {
        this.onResSetMyList(titleSlideInfo);
      }
    );
  }

  private onResSetMyList(titleSlideInfo: TitleSlideInfo) {
    const slideList: TitleSlideItem[] = titleSlideInfo.titleSlideList as TitleSlideItem[];

    for (let i = 0; i < slideList.length; i++) {
      if (this.homeTitleItem._id === slideList[i]._id) {
        this.isMyList = true;
        return;
      }
    }

    this.isMyList = false;
  }

  private updateMyListButton() {
    if (this.profileInfoService.account === undefined ||
      this.profileInfoService.account === null) {
        this.isMyList = false;
      }

    if (this.homeTitleItem) {
      this.isMyList = this.myListService
      .isMyList(
        this.profileInfoService.account._id,
        this.homeTitleItem._id
      );
    }
  }

  onEndedVideoClip() {
    this.isEndedVC = true;
    this.isPausedVC = false;
  }

  isEndedVideoClip() {
    return this.isEndedVC;
  }

  onClickMute() {
    this.isMuted = !this.isMuted;
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }

  onClickMyList() {
    if (this.isMyList) {
      this.myListService
      .reqDeleteMyList(this.homeTitleItem._id);
    } else {
      this.myListService
      .reqUpdateMyList(this.homeTitleItem._id);
    }
  }
}
