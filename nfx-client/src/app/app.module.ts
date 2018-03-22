import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
// import { HttpClientXsrfModule } from '@angular/common/http';

import { BaseModule } from './base/base.module';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';

import { ProfileInfoServcie } from './service/profile/profileinfo.service';
import { AccountService } from './service/account/account.service';
import { AuthGuard } from './service/auth/auth-guard.service';
import { httpInterceptorProviders } from './http-interceptors/index';


@NgModule({
  imports: [
    /* Angular Modules */
    BrowserModule,
    HttpClientModule,

    /* App Modules */
    BaseModule,

    /* Routing Module */
    AppRoutingModule, // Should be last order

    /* 3rd Modules */
    NgbModule.forRoot()
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    ProfileInfoServcie,
    AccountService,
    AuthGuard,
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule {}
