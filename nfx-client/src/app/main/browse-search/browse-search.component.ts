import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';

import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';
import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideService } from '../../service/title/title-slide.service';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';
import { MyListService } from '../../service/title/mylist.service';
import { SearchTitleService } from '../../service/title/search-title.service';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'nfx-browse-search',
  templateUrl: './browse-search.component.html',
  styleUrls: ['./browse-search.component.scss']
})
export class BrowseSearchComponent implements OnInit, AfterViewInit, OnDestroy {
  public titleSlideInfo: TitleSlideInfo = null;
  public numOfPages = Array(0).fill(0);
  public genreId: string = '';
  public searchKey: string = '';
  public isShowSearchMsg: boolean = false;

  private subsSearchResult: Subscription = null;

  constructor(
    private titleSilderService: TitleSlideService,
    private profileInfoService: ProfileInfoServcie,
    private myListService: MyListService,
    private searchTitleService: SearchTitleService
  ) {}

  ngOnInit() {
    this.initSearchInfo(this.searchTitleService.getSearchResult());
  }

  ngAfterViewInit() {
    this.titleSilderService.setTitleSlideListUpdatedEvent(this.titleSlideInfo);

    this.subsSearchResult = this.searchTitleService.resSearchResult$
    .subscribe(
      (slideInfo) => {
        this.initSearchInfo(slideInfo);
        this.titleSilderService.setTitleSlideListUpdatedEvent(this.titleSlideInfo);
      }
    );
  }

  ngOnDestroy() {
    if (this.subsSearchResult) {
      this.subsSearchResult.unsubscribe();
    }
  }

  private initSearchInfo(slideInfo: TitleSlideInfo) {
    this.numOfPages = Array(0).fill(0);
    this.titleSlideInfo = slideInfo;
    this.genreId = (this.titleSlideInfo) ? this.titleSlideInfo.genreId : '';
    this.searchKey = this.searchTitleService.searchKey;

    if (slideInfo && 
      slideInfo.titleSlideList && 
      slideInfo.titleSlideList.length > 0) {
      this.isShowSearchMsg = false;
    } else {
      this.isShowSearchMsg = true;
    }
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
