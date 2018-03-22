import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  TitleSlideInfo,
  URI_UPDATE_MY_LIST,
  URI_DELETE_MY_LIST
} from '@nfxcommon/model/title-slide.info';
import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { URI_GET_XSRF_TOKEN } from '@nfxcommon/common.define';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { ProfileInfoServcie } from '../profile/profileinfo.service';
import { AccountService } from '../account/account.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};


@Injectable()
export class MyListService {
  private myList: TitleSlideInfo = null;
  private tmMyList: any = null;
  private isReqMyList: boolean = false;
  private readonly INTV_MYLIST: number = 600;

  private updateMyListSource = new Subject<TitleSlideInfo>();
  private deleteMyListSource = new Subject<TitleSlideInfo>();
  private setMyListEventSource = new Subject<TitleSlideInfo>();

  public resUpdateMyList$ = this.updateMyListSource.asObservable();
  public resDeleteMyList$ = this.deleteMyListSource.asObservable();
  public resSetMyListEvent$ = this.setMyListEventSource.asObservable();

  constructor(
    private http: HttpClient,
    private accountService: AccountService,
    private router: Router,
    private profileInfoService: ProfileInfoServcie
  ) {}

  reqUpdateMyList(titleId: string) {
    if (this.isReqMyList) {
      return;
    }
    
    this.isReqMyList = true;

    this.updateMyList(titleId).subscribe(
      titleSlideInfo => this.updateMyListSource.next(titleSlideInfo));

    if (this.tmMyList) {
      clearTimeout(this.tmMyList);
    }

    this.tmMyList = setTimeout(() => {
      this.isReqMyList = false;
    }, this.INTV_MYLIST);
  }

  removeUpdateMyListObserver(observer: Observer<TitleSlideInfo>) {
    const index = this.updateMyListSource.observers.indexOf(observer);

    if (index >= 0) {
      this.updateMyListSource.observers.splice(index, 1);
    }
  }

  reqDeleteMyList(titleId: string) {
    if (this.isReqMyList) {
      return;
    }
    
    this.isReqMyList = true;

    this.deleteMyList(titleId).subscribe(
      titleSlideInfo => this.deleteMyListSource.next(titleSlideInfo));

    if (this.tmMyList) {
      clearTimeout(this.tmMyList);
    }

    this.tmMyList = setTimeout(() => {
      this.isReqMyList = false;
    }, this.INTV_MYLIST);
  }

  removeDeleteMyListObserver(observer: Observer<TitleSlideInfo>) {
    const index = this.deleteMyListSource.observers.indexOf(observer);

    if (index >= 0) {
      this.deleteMyListSource.observers.splice(index, 1);
    }
  }

  setMyList(titleSlideInfo: TitleSlideInfo) {
    if (this.profileInfoService.account === undefined ||
      this.profileInfoService.account === null ||
      titleSlideInfo === undefined ||
      titleSlideInfo === null ||
      this.profileInfoService.account._id !== titleSlideInfo.genreId) {
        return;
      }

    this.myList = titleSlideInfo;
    this.setMyListEventSource.next(titleSlideInfo);
  }

  isMyList(accountId: string, titleId: string): boolean {
    if (accountId === null || accountId === undefined ||
      titleId === null || titleId === undefined ||
      this.myList === null || this.myList === undefined ||
      this.myList.titleSlideList === null || this.myList.titleSlideList === undefined) {
      return false;
    }

    if (this.myList.genreId === accountId) {
      const titleItemList = this.myList.titleSlideList as TitleSlideItem[];

      for (let i = 0; i < titleItemList.length; i++) {
        if ((titleItemList[i]._id as string) === titleId) {
          return true;
        }
      }
    }

    return false;
  }

  updateMyList(titleId: string): Observable<TitleSlideInfo> {
    if (this.profileInfoService.account._id === null ||
      this.profileInfoService.account._id === undefined ||
      titleId === null || titleId === undefined) {
      return Observable.of(null);
    }

    if (this.isMyList(this.profileInfoService.account._id, titleId)) {
      return Observable.of(null);
    }

    const httpHeader = new HttpHeaders()
    .append(TitleSlideInfo.PARAM_ACCOUNT_ID, this.profileInfoService.account._id)
    .append(TitleSlideInfo.PARAM_TITLE_ID, titleId);

    const httpOptions = {
      headers: httpHeader,
      responseType: 'json' as 'json'
    };

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.accountService.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.put<TitleSlideInfo>(URI_UPDATE_MY_LIST, null, httpOptions)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);

          return Observable.of(null);
        }),
        tap((titleSlideInfo) => this.setMyList(titleSlideInfo))
      );
    });
  }

  deleteMyList(titleId: string): Observable<TitleSlideInfo> {
    if (this.profileInfoService.account._id === null ||
      this.profileInfoService.account._id === undefined ||
      titleId === null || titleId === undefined) {
      return Observable.of(null);
    }

    const httpHeader = new HttpHeaders()
    .append(TitleSlideInfo.PARAM_ACCOUNT_ID, this.profileInfoService.account._id)
    .append(TitleSlideInfo.PARAM_TITLE_ID, titleId);

    const httpOptions = {
      headers: httpHeader,
      responseType: 'json' as 'json'
    };

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.accountService.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.delete<TitleSlideInfo>(URI_DELETE_MY_LIST, httpOptions)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);

          return Observable.of(null);
        }),
        tap((titleSlideInfo) => this.setMyList(titleSlideInfo))
      );
    });
  }
}
