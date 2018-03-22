import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  TitleSlideItem,
  URI_SEARCH_TITLE
} from '@nfxcommon/model/title-slide.item';
import {
  TitleSlideInfo,
  SEARCH_TITLE_ID
} from '@nfxcommon/model/title-slide.info';
import { URI_GET_XSRF_TOKEN } from '@nfxcommon/common.define';
import { AccountService } from '../account/account.service';
import { Observable } from 'rxjs/Observable';
import { Subject }    from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import {
  catchError,
  map,
  switchMap,
  tap,
  debounceTime,
  distinctUntilChanged
} from 'rxjs/operators';


@Injectable()
export class SearchTitleService {
  private searchResult: TitleSlideInfo = null;
  private searchKeyAddedSource = new Subject<string>();
  private resSearchKeyAdded$: Observable<string> = null;
  private searchResultSource = new Subject<TitleSlideInfo>();  

  public resSearchResult$ = this.searchResultSource.asObservable();
  public searchKey: string = '';


  constructor(
    private accountService: AccountService,
    private router: Router,
    private http: HttpClient) {
    this.registerSearchKeyAddedEvent();
  }

  private createSearchInfo(slideItemList: TitleSlideItem[]): TitleSlideInfo {
    const slideInfo: TitleSlideInfo = new TitleSlideInfo();
    slideInfo.genreId = SEARCH_TITLE_ID;

    if (slideItemList && slideItemList.length > 0) {
      slideInfo.titleSlideList = slideItemList;
    }

    return slideInfo;
  }

  private searchTitle(searchKey: string): Observable<TitleSlideInfo> {
    const httpHeader = new HttpHeaders()
    .append(TitleSlideItem.PARAM_SEARCHKEY, searchKey);

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
      return this.http.get<TitleSlideItem[]>(URI_SEARCH_TITLE, httpOptions)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.accountService.isLoggedIn = false;
          this.router.navigate(['/error', err.status]);
          
          return Observable.of(null);
        })
      )
      .switchMap(
        (slideItemList: TitleSlideItem[]) => {
          return Observable.of(this.createSearchInfo(slideItemList));
        }
      );
    });    
  }

  private registerSearchKeyAddedEvent() {
    this.resSearchKeyAdded$ = this.searchKeyAddedSource.pipe(
      debounceTime(500),
      distinctUntilChanged()
    );

    this.resSearchKeyAdded$
    .subscribe(searchKey => this.resSearchKeyAdded(searchKey));
  }

  private resSearchKeyAdded(searchKey: string) {
    if (searchKey === undefined || 
      searchKey == null ||
      searchKey.length < 1) {
      this.searchKey = '';
      this.searchResult = null;
      this.searchResultSource.next(null);
      return;
    }

    this.searchKey = searchKey;

    this.searchTitle(searchKey)
    .subscribe(
      (slideInfo) => {
        this.searchResult = slideInfo;
        this.searchResultSource.next(slideInfo);
      }
    );
  }

  public reqSearchTitle(searchKey: string) {
    this.searchKeyAddedSource.next(searchKey);
  }

  public getSearchResult(): TitleSlideInfo {
    return this.searchResult;
  }
}
