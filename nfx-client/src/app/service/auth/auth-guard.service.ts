import { Injectable } from '@angular/core';
import {
  Route,
  Router,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  NavigationExtras
} from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AccountService } from '../account/account.service';


@Injectable()
export class AuthGuard implements CanLoad, CanActivate {
  constructor(private accountService: AccountService, private router: Router) {}

  canLoad(route: Route): boolean {
    return this.checkLogin(`/${route.path}`);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    return this.checkLogin(state.url);
  }

  checkLogin(url: string): boolean {
    if (this.accountService.isLoggedIn) {
      return true;
    }

    this.router.navigate(['/home']);

    return false;
  }
}
