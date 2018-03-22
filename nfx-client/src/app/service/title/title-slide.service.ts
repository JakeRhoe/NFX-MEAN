import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { URI_GET_XSRF_TOKEN } from '@nfxcommon/common.define';
import {
  TitleSlideInfo,
  URI_GET_TITLE_SLIDE_INFO
} from '@nfxcommon/model/title-slide.info';
import {
  TitleSlideItem
} from '@nfxcommon/model/title-slide.item';

import { AccountService } from '../account/account.service';
import { ItemCollapseEvent } from './title-slide.event';
import { ItemSelectedEvent } from './title-slide.event';
import { TitleSlideListUpdatedEvent } from './title-slide.event';
import { MyListService } from './mylist.service';


@Injectable()
export class TitleSlideService {
  private titleSlideInfoSource = new Subject<TitleSlideInfo>();
  private itemCollapseEventSource = new Subject<ItemCollapseEvent>();
  private itemSelectedEventSource = new Subject<ItemSelectedEvent>();
  private titleSlideListUpdatedEventSource = new Subject<TitleSlideListUpdatedEvent>();

  public resTitleSlideInfo$ = this.titleSlideInfoSource.asObservable();
  public resItemCollpaseEvent$ = this.itemCollapseEventSource.asObservable();
  public resItemSelectedEvent$ = this.itemSelectedEventSource.asObservable();
  public resTitleSlideListUpdatedEvent$ = this.titleSlideListUpdatedEventSource.asObservable();

  constructor(
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient,
    private myListService: MyListService
  ) {}

  private getTitleSlideInfo(genreId: string): Observable<TitleSlideInfo> {
    if (genreId === null || genreId === undefined) {
      return Observable.of(null);
    }

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.accountService.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<TitleSlideInfo>(`${URI_GET_TITLE_SLIDE_INFO}/${genreId}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);
  
          return Observable.of(null);
        }),
        tap((titleSlideInfo) => this.myListService.setMyList(titleSlideInfo))
      );
    });
  }

  private getItemCollapseEvent(
    genreId: string,
    itemIndex: number,
    currentPage: number,
    isOpened: boolean): Observable<ItemCollapseEvent> {
    return Observable.of(new ItemCollapseEvent(genreId, itemIndex, currentPage, isOpened));
  }

  private getItemSelectedEvent(
    genreId: string,
    itemIndex: number,
    currentPage: number): Observable<ItemSelectedEvent> {
    return Observable.of(new ItemSelectedEvent(genreId, itemIndex, currentPage));
  }

  private getTitleSlideListUpdatedEvent(titleSlideInfo: TitleSlideInfo): Observable<TitleSlideListUpdatedEvent> {
    return Observable.of(new TitleSlideListUpdatedEvent(titleSlideInfo));
  }

  reqTitleSlideInfo(genreId: string) {
    this.getTitleSlideInfo(genreId).subscribe(
      titleSlideInfo => this.titleSlideInfoSource.next(titleSlideInfo));
  }

  setItemCollapseEvent(
    genreId: string,
    itemIndex: number,
    isOpened: boolean,
    currentPage: number = -1) {
    this.getItemCollapseEvent(genreId, itemIndex, currentPage, isOpened).subscribe(
      itemCollapseEvent => { this.itemCollapseEventSource.next(itemCollapseEvent); }
    );
  }

  setItemSelectedEvent(
    genreId: string,
    itemIndex: number,
    currentPage: number = -1) {
    this.getItemSelectedEvent(genreId, itemIndex, currentPage).subscribe(
      itemSelectedEvent => { this.itemSelectedEventSource.next(itemSelectedEvent); }
    );
  }

  setTitleSlideListUpdatedEvent(titleSlideInfo: TitleSlideInfo) {
    this.getTitleSlideListUpdatedEvent(titleSlideInfo).subscribe(
      titleSlideListUpdatedEvent => {
        this.titleSlideListUpdatedEventSource.next(titleSlideListUpdatedEvent); 
      }
    );
  }
}
