import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { BaseRoutingModule } from './base-routing.module';
import { NfxJumpToBookmarkModule } from '../lib/ui/nfx-jump-to-bookmark/nfx-jump-to-bookmark.module';

import { BasicHomeComponent } from './basic-home/basic-home.component';
import { FooterComponent } from './footer/footer.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorComponent } from './error/error.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    BaseRoutingModule,
    NfxJumpToBookmarkModule
  ],
  declarations: [
    BasicHomeComponent,
    FooterComponent,
    NotFoundComponent,
    ErrorComponent
  ],
  exports: [
    FooterComponent,
    NotFoundComponent
  ]
})

export class BaseModule {}
