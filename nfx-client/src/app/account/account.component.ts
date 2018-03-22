import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject,
  Renderer2
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { Observable } from 'rxjs/observable';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { windowRefProvider, WINDOW_REF } from '../service/window/window.service';
import { AccountService } from '../service/account/account.service';
import { ProfileInfoServcie } from '../service/profile/profileinfo.service';
import { NfxFocusDirective } from '../lib/ui/nfx-focus/nfx-focus.directive';


@Component({
  selector: 'nfx-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  providers: [ windowRefProvider ]
})
export class AccountComponent implements AfterViewInit, OnDestroy {
  public userEmail: string = null;
  public userPWD: string = null;
  public userNewPWD: string = null;
  public isFocusedEmail: boolean = false;
  public isFocusedPWD: boolean = false;
  public isFocusedNewPWD: boolean = false;
  public isExistEmail: boolean = false;
  public isVisibleUpdateMsg: boolean = false;
  public isConfirmedPWD: boolean = false;
  public isUpdated: boolean = false;
  public goHomeCount: number = 5;

  public isTest: boolean = false;

  private tmGoHome: number = null;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private router: Router,
    private renderer: Renderer2,
    private accountService: AccountService,
    private profileInfoServcie: ProfileInfoServcie
  ) {}

  ngAfterViewInit() {
    if (this.profileInfoServcie.account) {
      this.userEmail = this.profileInfoServcie.account.email;
    }

    this.checkTest();

    this.renderer.addClass(document.body, 'theme-gray');
  }

  ngOnDestroy() {
    if (this.tmGoHome) {
      this.window.clearInterval(this.tmGoHome);
    }
  }

  private checkTest() {
    if (this.profileInfoServcie.account) {
      const userEmail: string = this.profileInfoServcie.account.email;

      this.isTest = (userEmail.toLowerCase() === 'test@mail.com');
    }
  }

  onFocusedEmail() {
    this.isFocusedEmail = true;
  }

  onBluredEmail() {
    this.isFocusedEmail = false;

    if (this.userEmail === null || this.userEmail === undefined) {
      return;
    }

    if (this.userEmail.length < 1) {
      return;
    }

    if (this.userEmail.toUpperCase() === this.profileInfoServcie.account.email.toUpperCase()) {
      this.isExistEmail = false;
      return;
    }

    this.accountService.existEmail(this.userEmail)
    .subscribe((isExist) => {
      this.isExistEmail = isExist;
    });
  }

  onFocusedPWD() {
    this.isFocusedPWD = true;
  }

  onBluredPWD() {
    this.isFocusedPWD = false;

    this.confirmPWD();
  }

  private confirmPWD() {
    this.accountService.getAccount(
      this.profileInfoServcie.account.email,
      this.userPWD
    )
    .subscribe((account) => {
      if (account) {
        this.isConfirmedPWD = true;
        this.isVisibleUpdateMsg = false;
      } else {
        this.isConfirmedPWD = false;
        this.isVisibleUpdateMsg = true;
      }
    });
  }

  onFocusedNewPWD() {
    this.isFocusedNewPWD = true;
  }

  onBluredNewPWD() {
    this.isFocusedNewPWD = false;
  }

  onSubmitAccount() {
    if (this.isTest) {
      return;
    }

    if (!this.isConfirmedPWD) {
      return;
    }

    this.accountService.updateAccount(
      this.profileInfoServcie.account._id,
      this.userEmail,
      this.userPWD,
      this.userNewPWD
    )
    .subscribe((account) => {
      if (account) {
        this.profileInfoServcie.account = account;
        this.isVisibleUpdateMsg = true;
        this.isUpdated = true;

        this.tmGoHome = this.window.setInterval(
          () => {
            this.goHomeCount--;

            if (this.goHomeCount < 0) {
              this.router.navigate(['/']);
            }
          },
          1000
        );

      } else {
        this.router.navigate(['/error']);
      }
    });
  }

  onTest() {
    this.accountService.logout()
    .subscribe(() => {
      this.router.navigate(['/signup']);
    });
  }
}
