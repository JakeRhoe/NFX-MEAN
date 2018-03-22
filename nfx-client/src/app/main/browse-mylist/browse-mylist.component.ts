import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';
import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideService } from '../../service/title/title-slide.service';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';
import { MyListService } from '../../service/title/mylist.service';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


@Component({
  selector: 'nfx-browse-mylist',
  templateUrl: './browse-mylist.component.html',
  styleUrls: ['./browse-mylist.component.scss']
})
export class BrowseMylistComponent implements OnInit, OnDestroy {
  public titleSlideInfo: TitleSlideInfo = null;
  public numOfPages = Array(0).fill(0);
  public genreId: string = '';

  private subsTitleSlideInfo: Subscription = null;
  private subsUpdateMyList: Subscription = null;
  private subsDeleteMyList: Subscription = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleSilderService: TitleSlideService,
    private profileInfoService: ProfileInfoServcie,
    private myListService: MyListService
  ) {}

  ngOnInit() {
    this.registerTitleSlideInfoCallback();

    this.genreId = this.profileInfoService.account._id;
    this.numOfPages = Array(0).fill(0);
    this.titleSilderService.reqTitleSlideInfo(this.genreId);

    this.registerUpdateMyListCallback();
    this.registerDeleteMyListCallback();
  }

  ngOnDestroy() {
    if (this.subsTitleSlideInfo) {
      this.subsTitleSlideInfo.unsubscribe();
    }

    if (this.subsUpdateMyList) {
      this.subsUpdateMyList.unsubscribe();
    }

    if (this.subsDeleteMyList) {
      this.subsDeleteMyList.unsubscribe();
    }
  }

  private registerTitleSlideInfoCallback() {
    if (this.subsTitleSlideInfo) {
      this.subsTitleSlideInfo.unsubscribe();
    }

    this.subsTitleSlideInfo = 
    this.titleSilderService.resTitleSlideInfo$
      .subscribe(titleSlideInfo => this.onResTitleSlideInfo(titleSlideInfo));
  }

  private onResTitleSlideInfo(titleSlideInfo: TitleSlideInfo) {
    this.titleSlideInfo = titleSlideInfo;
    this.titleSlideInfo.titleSlideList.reverse();
    this.titleSilderService.setTitleSlideListUpdatedEvent(titleSlideInfo);
  }

  private registerUpdateMyListCallback() {
    this.subsUpdateMyList = 
    this.myListService.resUpdateMyList$
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
    this.numOfPages = Array(0).fill(0);
    this.titleSlideInfo = titleSlideInfo;
    this.titleSlideInfo.titleSlideList.reverse();
    this.titleSilderService.setTitleSlideListUpdatedEvent(titleSlideInfo);
  }

  private registerDeleteMyListCallback() {
    this.subsDeleteMyList = 
    this.myListService.resDeleteMyList$
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
    this.numOfPages = Array(0).fill(0);
    this.titleSlideInfo = titleSlideInfo;
    this.titleSlideInfo.titleSlideList.reverse();
    this.titleSilderService.setTitleSlideListUpdatedEvent(titleSlideInfo);
  }

  onChangeNumOfSlots(numOfSlots: number) {
    let numOfItems = 0;
    let numOfPages = 0;

    if (this.titleSlideInfo) {
      numOfItems = this.titleSlideInfo.titleSlideList.length;

      if (numOfSlots > 2) {
        numOfPages = Math.floor(numOfItems / (numOfSlots - 2));
        numOfPages += (Math.ceil(numOfItems % (numOfSlots - 2)) > 0) ? 1 : 0;
      }
    }

    this.numOfPages = Array(numOfPages - 1).fill(0);
  }

  onClickMyList(itemIndex: number) {
    let titleSlideInfo$: Observable<TitleSlideInfo> = null;
    const titleSlideList = this.titleSlideInfo.titleSlideList as TitleSlideItem[];
    
    if (this.myListService.isMyList(
      this.profileInfoService.account._id,
      titleSlideList[itemIndex]._id
    )) {
      this.myListService
      .reqDeleteMyList(titleSlideList[itemIndex]._id);
    } else {
      this.myListService
      .reqUpdateMyList(titleSlideList[itemIndex]._id);
    }
  }
}
