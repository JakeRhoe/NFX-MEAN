import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BasicHomeComponent } from './basic-home/basic-home.component';
import { NotFoundComponent } from './not-found/not-found.component';


const baseRoutes: Routes = [
  {
    path: 'home',
    component: BasicHomeComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(baseRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class BaseRoutingModule {}
