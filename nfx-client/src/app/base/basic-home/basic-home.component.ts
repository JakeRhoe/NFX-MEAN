import 'rxjs/add/operator/switchMap';
import { Component, Input, Inject } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AccountService } from '../../service/account/account.service';

@Component({
  selector: 'nfx-basic-home',
  templateUrl: './basic-home.component.html',
  styleUrls: ['./basic-home.component.scss']
})
export class BasicHomeComponent {
  public bookmarkId: string = null;
  public endDate: Date = new Date(new Date().setMonth(new Date().getMonth() + 1));   

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService
  ) {}

  onClickBookmark(bookmarkId: string) {
    this.bookmarkId = bookmarkId;
  }

  isSameBookmark(bookmarkId: string): boolean {
    return (this.bookmarkId === bookmarkId);
  }

  onClickTestSignIn() {
    this.accountService.login('test@mail.com', 'testtest')
    .subscribe((isValid) => {
      if (isValid) {
        this.router.navigate(['/']);
      }
    });
  }
}
