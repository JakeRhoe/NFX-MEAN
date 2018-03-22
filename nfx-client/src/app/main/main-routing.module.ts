import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../service/auth/auth-guard.service';
import { BrowseMainComponent } from './browse-main/browse-main.component';
import { BrowseHomeComponent } from './browse-home/browse-home.component';
import { BrowseGenreComponent } from './browse-genre/browse-genre.component';
import { BrowseMylistComponent } from './browse-mylist/browse-mylist.component';
import { BrowseSearchComponent } from './browse-search/browse-search.component';
import { AboutComponent } from './about/about.component';


const mainRoutes: Routes = [
  {
    path: '',
    component: BrowseMainComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'genre/:genreId',
        component: BrowseGenreComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'my-list',
        component: BrowseMylistComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'search',
        component: BrowseSearchComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'about',
        component: AboutComponent,
        canActivate: [AuthGuard]
      },
      {
        path: '',
        component: BrowseHomeComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];


@NgModule({
  imports: [
    RouterModule.forChild(mainRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class MainRoutingModule {}
