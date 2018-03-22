import {
  Component,
  Inject,
  ElementRef,
  Renderer2,
  OnInit,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterEvent
} from '@angular/router';

import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';

import { windowRefProvider, WINDOW_REF } from '../../service/window/window.service';
import { AccountService } from '../../service/account/account.service';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';
import { HomeTitleService } from '../../service/title/home-title.service';
import { SearchTitleService } from '../../service/title/search-title.service';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import * as moment from 'moment';


@Component({
  selector: 'nfx-main-header',
  templateUrl: './main-header.component.html',
  styleUrls: ['./main-header.component.scss'],
  providers: [ windowRefProvider ]
})
export class MainHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  public isVisibleAdultSearch = false;
  public searchKey: string = null;
  public userNick: string = null;
  public newTitleList: TitleSlideItem[] = null;

  private previousUrl: string = '/';
  private tmCloseSearch: number = null;
  private subsSearchResult: Subscription = null;
  

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private accountService: AccountService,
    private profileInfoService: ProfileInfoServcie,
    private homeTitleService: HomeTitleService,
    private searchTitleService: SearchTitleService
  ) {}

  ngOnInit() {
    this.router.events
    .filter(event => event instanceof NavigationEnd)
    .subscribe((event: NavigationEnd) => { this.onResNavEvent(event); });
  }

  ngAfterViewInit() {
    this.homeTitleService.getNewTitleList()
    .subscribe((titleSlideItemList) => {
      this.newTitleList = titleSlideItemList;
    });

    this.setUserNick();

    this.subsSearchResult = this.searchTitleService.resSearchResult$
    .subscribe((slideInfo) => this.onResSearchResult(slideInfo));
  }

  ngOnDestroy() {
    if (this.tmCloseSearch) {
      this.window.clearTimeout(this.tmCloseSearch);
    }

    if (this.subsSearchResult) {
      this.subsSearchResult.unsubscribe();
    }
  }

  private setUserNick() {
    let userNick: string = '';
    
    if (this.profileInfoService.account) {
      userNick = this.profileInfoService.account.email;
    }

    userNick = userNick.substr(0, userNick.indexOf('@'));

    if (userNick.length > 13) {
      userNick = userNick.substr(0, 10) + '...';
    }

    this.userNick = userNick;    
  }

  private closeSearch()
  {
    if (this.tmCloseSearch) {
      this.window.clearTimeout(this.tmCloseSearch);
    }

    this.tmCloseSearch = this.window.setTimeout(
      () => {
        this.searchKey = '';
        this.isVisibleAdultSearch = false;
      },
      200
    );
  }

  private onResSearchResult(slideInfo: TitleSlideInfo) {
    this.router.navigate(['/browse/search'])
  }

  private onResNavEvent(event: NavigationEnd) {
    if (event.url.toLowerCase() === '/browse/search') {
      return;
    }

    this.closeSearch();
  }

  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }

  setKidProfile(kidProfile: boolean) {
    this.profileInfoService.isKid = kidProfile;

    this.renderer.removeClass(document.body, 
      kidProfile ? 'theme-dark' : 'theme-light');

    this.renderer.addClass(document.body, 
      kidProfile ? 'theme-light' : 'theme-dark');
  }

  onClickAdultSearch() {
    this.isVisibleAdultSearch = true;

    if (this.router.url.toLowerCase() !== '/browse/search') {
      this.previousUrl = this.router.url;
    }
  }

  onBlurAdultSearch() {
    if (this.searchKey && this.searchKey.length > 0) {
      return;
    }

    this.closeSearch();
    this.router.navigate([this.previousUrl]);
  }

  onClickAccount() {
    this.router.navigate(['/account']);
  }

  onClickSignOut() {
    this.accountService.logout()
    .subscribe(() => {
      this.router.navigate(['/home']);
    });
  }

  getFromDate(regDate: Date): string {
    return regDate ? moment(regDate).from(new Date()) : '';
  }

  onClickClearSearch() {
    this.searchKey = null;
    this.searchTitleService.reqSearchTitle('');
  }

  onKeyUpSearch(searchKey: string) {
    this.searchTitleService.reqSearchTitle(searchKey);
  }
}
