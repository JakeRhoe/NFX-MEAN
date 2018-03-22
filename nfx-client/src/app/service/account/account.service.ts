import { Injectable } from '@angular/core'
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Account,
  URI_LOGIN,
  URI_LOGOUT,
  URI_GET_ACCOUNT,
  URI_EXIST_EMAIL,
  URI_CREATE_ACCOUNT,
  URI_UPDATE_ACCOUNT
} from '@nfxcommon/model/account';
import { ProfileInfoServcie } from '../profile/profileinfo.service';
import { URI_GET_XSRF_TOKEN, JWT_AUTHTOKEN } from '@nfxcommon/common.define';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { empty } from 'rxjs/observable/empty';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


@Injectable()
export class AccountService {
  public isLoggedIn = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private profileInfoService: ProfileInfoServcie
  ) {}

  public login(email: string, pwd: string): Observable<boolean> {
    if (email === null || email === undefined || pwd === null || pwd === undefined) {
      return Observable.of(null);
    }

    const httpHeader = new HttpHeaders()
    .append(Account.PARAM_EMAIL, email)
    .append(Account.PARAM_PWD, pwd);

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<Account>(
        URI_LOGIN,
        {
          headers: httpHeader,
          responseType: 'json',
          withCredentials: true
        }
      )
      .pipe(
        catchError((err) => Observable.of(null))
      )
      .switchMap((account) => {
        if (account) {
          if (account.email.toUpperCase() === email.toUpperCase()) {
            this.isLoggedIn = true;
            this.profileInfoService.account = account;
            
            return Observable.of(true);
          }
        }
  
        return Observable.of(false);
      });
    });
  }

  public logout(): Observable<boolean> {
    const account: Account = this.profileInfoService.account;

    if (account === null || account === undefined) {
      return Observable.of(false);
    }

    return this.http.put(URI_LOGOUT, account)
    .pipe(
      catchError((err) => Observable.of(false))
    )
    .pipe(
      tap(
        () => {
          this.isLoggedIn = false;
          sessionStorage.removeItem(JWT_AUTHTOKEN);
        }
      )
    )
    .switchMap(() => { return Observable.of(true); });
  }

  public getAccount(email: string, pwd: string): Observable<Account> {
    if (email === null || email === undefined || pwd === null || pwd === undefined) {
      return Observable.of(null);
    }

    const httpHeader = new HttpHeaders()
    .append(Account.PARAM_EMAIL, email)
    .append(Account.PARAM_PWD, pwd);
    
    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<Account>(
        URI_GET_ACCOUNT,
        {
          headers: httpHeader,
          responseType: 'json'
        }
      )
      .pipe(
        catchError((err) => Observable.of(null))
      );
    });
  }

  public createAccount(email: string, pwd: string): Observable<boolean> {
    if (email === null || email === undefined || pwd === null || pwd === undefined) {
      return Observable.of(false);
    }

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    };    

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.post<Account>(URI_CREATE_ACCOUNT, new Account(null, email, pwd), httpOptions)
      .pipe(
        catchError((err) => Observable.of(null))
      )
      .switchMap((account: Account) => {    
        if (account) {
          return Observable.of(true);
        }

        return Observable.of(false);
      });
    });
  }

  public existEmail(email: string): Observable<boolean> {
    if (email === null || email === undefined) {
      return Observable.of(true);
    }

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.get<boolean>(`${URI_EXIST_EMAIL}/${email.trim()}`, { responseType: 'json' })
      .pipe(catchError((err) => { return Observable.of(true); }));
    });
  }

  public updateAccount(id: string, email: string, pwd: string, newpwd: string = null): Observable<Account> {
    if (id === null || id === undefined || 
      email === null || email === undefined || 
      pwd === null || pwd === undefined) {
      return Observable.of(null);
    }

    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      responseType: 'json' as 'json'
    };    

    const account: Account = new Account(id, email, pwd, newpwd);

    return this.http.get(URI_GET_XSRF_TOKEN)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        this.isLoggedIn = false;
        this.router.navigate(['/error', err.status]);

        return Observable.of(null);
      })
    )
    .switchMap(() => {
      return this.http.put<Account>(URI_UPDATE_ACCOUNT, account, httpOptions)
      .pipe(
        catchError((err) => Observable.of(null))
      );
    });
  }
}
