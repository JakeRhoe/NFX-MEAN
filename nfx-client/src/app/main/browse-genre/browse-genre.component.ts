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
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'nfx-browse-genre',
  templateUrl: './browse-genre.component.html',
  styleUrls: ['./browse-genre.component.scss']
})
export class BrowseGenreComponent implements OnInit, OnDestroy {
  public titleSlideInfo: TitleSlideInfo = null;
  public numOfPages = Array(0).fill(0);
  public genreId: string = '';

  private subsTitleSlideInfo: Subscription = null;
  
  constructor(
    private activatedRoute: ActivatedRoute,
    private titleSilderService: TitleSlideService,
    private profileInfoService: ProfileInfoServcie,
    private myListService: MyListService
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
    .switchMap((param: ParamMap) => {
      return Observable.of(param.get('genreId'));
    })
    .pipe(
      tap(() => this.registerTitleSlideInfoCallback())
    )
    .subscribe((genreId: string) => {
      this.genreId = genreId;
      this.numOfPages = Array(0).fill(0);
      this.titleSilderService.reqTitleSlideInfo(this.genreId);
    });
  }

  ngOnDestroy() {
    if (this.subsTitleSlideInfo) {
      this.subsTitleSlideInfo.unsubscribe();
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
