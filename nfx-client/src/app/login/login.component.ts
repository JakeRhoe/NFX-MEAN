import {
  Component,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';

import { windowRefProvider, WINDOW_REF } from '../service/window/window.service';
import { AccountService } from '../service/account/account.service';

import { NfxFocusDirective } from '../lib/ui/nfx-focus/nfx-focus.directive';
import { NfxUtil } from '../lib/util/nfx-util';
import { NFX_EMAIL } from '@nfxcommon/common.define';

@Component({
  selector: 'nfx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ windowRefProvider ]
})
export class LoginComponent implements AfterViewInit, OnDestroy {
  private readonly REMEMBER_ME_COOKIE: string = 'RememberMe';
  private tmBlurLoginPWD: number = null;
  private isForcedFocusLoginPWD = false;

  public userEmail: string = null;
  public userPWD: string = null;
  public rememberMe: boolean = false;
  public isFocusedPWD = false;
  public isVisiblePWD = false;
  public isSubmitted = false;
  public isValidAccount = false;

  @ViewChild('loginPWD') loginPWD: NfxFocusDirective;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private accountService: AccountService,
    private router: Router
  ) {}

  ngAfterViewInit() {
    const savedEmail: string = NfxUtil.getCookie(NFX_EMAIL);
    const rememberMe: string = NfxUtil.getCookie(this.REMEMBER_ME_COOKIE);

    if (rememberMe && rememberMe === '1') {
      this.rememberMe = true;
      
      if (savedEmail && savedEmail.length > 0) {
        this.userEmail = savedEmail;
      }
    }
  }

  ngOnDestroy() {
    if (this.tmBlurLoginPWD) {
      this.window.clearTimeout(this.tmBlurLoginPWD);
    }
  }

  onSubmitLogin() {
    this.accountService.login(this.userEmail, this.userPWD)
    .subscribe((isValid) => {
      this.isValidAccount = isValid;
      this.isSubmitted = true;

      if (isValid) {
        this.router.navigate(['/']);
      }
    });

    NfxUtil.setCookie(this.REMEMBER_ME_COOKIE, this.rememberMe ? '1' : '0', 30);
  }

  onFocusPWD() {
    this.isFocusedPWD = true;
  }

  onBlurPWD() {
    if (this.tmBlurLoginPWD) {
      this.window.clearTimeout(this.tmBlurLoginPWD);
    }

    this.window.setTimeout(
      () => {
        if (!this.isForcedFocusLoginPWD) {
          this.isFocusedPWD = false;
        }

        this.isForcedFocusLoginPWD = false;
      },
      300
    );
  }

  onClickShowPWD() {
    this.isForcedFocusLoginPWD = true;
    this.loginPWD.setFocus();
    this.isVisiblePWD = true;
  }

  onClickHidePWD() {
    this.isForcedFocusLoginPWD = true;
    this.loginPWD.setFocus();
    this.isVisiblePWD = false;
  }
}
