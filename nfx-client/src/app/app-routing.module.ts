import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './service/auth/auth-guard.service';
import { ErrorComponent } from './base/error/error.component';
import { NotFoundComponent } from './base/not-found/not-found.component';
import { SelectivePreloadingStrategy } from './selective-preloading-strategy';
import { BasicHomeComponent } from './base/basic-home/basic-home.component';


const appRoutes: Routes = [
  {
    path: 'error/:status',
    component: ErrorComponent
  },
  {
    path: 'login',
    loadChildren: 'app/login/login.module#LoginModule',
    data: { preload: true }
  },
  {
    path: 'signup',
    loadChildren: 'app/signup/signup.module#SignupModule'
  },
  {
    path: 'profilegate',
    loadChildren: 'app/profile/profile.module#ProfileModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'account',
    loadChildren: 'app/account/account.module#AccountModule',
    canLoad: [AuthGuard]
  },
  {
    path: 'browse',
    loadChildren: 'app/main/main.module#MainModule',
    canLoad: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/browse',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];


@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {
        // LOCAL DIST TEST
        // useHash: true,
        enableTracing: false,
        preloadingStrategy: SelectivePreloadingStrategy
      }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SelectivePreloadingStrategy
  ]
})

export class AppRoutingModule { }
