import {
  Component,
  AfterViewInit,
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
import { NfxFocusDirective } from '../lib/ui/nfx-focus/nfx-focus.directive';
import { Account } from '@nfxcommon/model/account';

import { ProfileInfoServcie } from '../service/profile/profileinfo.service';

@Component({
  selector: 'nfx-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [ windowRefProvider ]
})
export class SignupComponent implements AfterViewInit {
  public userEmail: string = null;
  public userPWD: string = null;
  public isFocusedEmail: boolean = false;
  public isFocusedPWD: boolean = false;
  public isExistEmail: boolean = false;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private router: Router,
    private renderer: Renderer2,
    private accountService: AccountService,
    private profileInfoService: ProfileInfoServcie
  ) {}

  ngAfterViewInit() {
    this.renderer.addClass(document.body, 'theme-gray');
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
  }

  onSubmitSignup() {
    this.accountService.createAccount(this.userEmail, this.userPWD)
    .switchMap((isCreated) => {
      if (isCreated) {
        return this.accountService.login(this.userEmail, this.userPWD);
      } else {
        return empty();
      }
    })
    .subscribe((isLogin) => { this.router.navigate(['/']); });
  }
}
