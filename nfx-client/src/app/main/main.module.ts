import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BaseModule } from '../base/base.module';
import { NfxPopoverModule } from '../lib/ui/nfx-popover/nfx-popover.module';
import { NfxFocusModule } from '../lib/ui/nfx-focus/nfx-focus.module';
import { NfxTitleSliderModule } from '../lib/ui/nfx-titleslider/nfx-titleslider.module';
import { MainRoutingModule } from './main-routing.module';

import { MainHeaderComponent } from './main-header/main-header.component';
import { SubHeaderComponent } from './sub-header/sub-header.component';
import { BrowseMainComponent } from './browse-main/browse-main.component';
import { BrowseHomeComponent } from './browse-home/browse-home.component';
import { BrowseGenreComponent } from './browse-genre/browse-genre.component';
import { BrowseMylistComponent } from './browse-mylist/browse-mylist.component';
import { BrowseSearchComponent } from './browse-search/browse-search.component';
import { AboutComponent } from './about/about.component';

import { MyListService } from '../service/title/mylist.service';
import { HomeTitleService } from '../service/title/home-title.service';
import { SearchTitleService } from '../service/title/search-title.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,

    BaseModule,
    MainRoutingModule,
    NfxPopoverModule,
    NfxFocusModule,
    NfxTitleSliderModule
  ],
  declarations: [
    MainHeaderComponent,
    SubHeaderComponent,
    BrowseMainComponent,
    BrowseHomeComponent,
    BrowseGenreComponent,
    BrowseMylistComponent,
    BrowseSearchComponent,
    AboutComponent
  ],
  providers: [
    MyListService,
    HomeTitleService,
    SearchTitleService
  ]
})

export class MainModule { }
