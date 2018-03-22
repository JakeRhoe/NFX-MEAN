import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { ProfileInfoServcie } from '../service/profile/profileinfo.service';
import {
  NFX_ID,
  JWT_AUTHORIZATION,
  JWT_AUTHTOKEN
} from '@nfxcommon/common.define';
import { map, switchMap } from 'rxjs/operators';
import 'rxjs/add/operator/do';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private profileInfoService: ProfileInfoServcie
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler)
  : Observable<HttpEvent<any>> {
    const authToken = sessionStorage.getItem(JWT_AUTHTOKEN);
    let authReq = req;

    if (authToken) {
      authReq = authReq.clone({
        headers: authReq.headers.set(JWT_AUTHORIZATION, authToken)
      });
    }

    if (this.profileInfoService.account) {
      authReq = authReq.clone({
        headers: authReq.headers.set(NFX_ID, this.profileInfoService.account._id as string)
      });
    }

    return next.handle(authReq)
    .do((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        const authToken = event.headers.get(JWT_AUTHTOKEN);

        if (authToken && authToken.length > 0) {
          sessionStorage.setItem(JWT_AUTHTOKEN, event.headers.get(JWT_AUTHTOKEN));
        }
      }
    });
  }
}
