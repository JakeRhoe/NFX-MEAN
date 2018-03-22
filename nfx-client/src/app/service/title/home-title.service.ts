import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  TitleSlideItem,
  URI_GET_HOME_TITLE,
  URI_GET_NEW_TITLE_LIST
} from '@nfxcommon/model/title-slide.item';
import { URI_GET_XSRF_TOKEN } from '@nfxcommon/common.define';
import { AccountService } from '../account/account.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


@Injectable()
export class HomeTitleService {
  constructor(
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient
  ) {}

  public getHomeTitle(): Observable<TitleSlideItem> {
    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.accountService.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<TitleSlideItem>(URI_GET_HOME_TITLE)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);

          return Observable.of(null);
        })
      );
    });
  }

  public getNewTitleList(): Observable<TitleSlideItem[]> {
    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.accountService.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<TitleSlideItem[]>(URI_GET_NEW_TITLE_LIST)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);

          return Observable.of(null);
        })
      );
    });
  }
}
