import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NfxJumpToBookmarkModule } from '../nfx-jump-to-bookmark/nfx-jump-to-bookmark.module';

import { NfxTitleSliderComponent } from './nfx-titleslider.component';
import { NfxTitleSlideItemComponent } from './nfx-titleslideitem.component';
import { NfxTitleSlideItemDirective } from './nfx-titleslideitem.directive';
import { NfxTitleListComponent } from './nfx-titlelist.component';
import { TitleSlideService } from '../../../service/title/title-slide.service';


@NgModule({
  imports: [
    CommonModule,
    NfxJumpToBookmarkModule
  ],
  declarations: [
    NfxTitleSliderComponent,
    NfxTitleSlideItemComponent,
    NfxTitleListComponent,
    NfxTitleSlideItemDirective,    
  ],
  exports: [
    NfxTitleSliderComponent,
    NfxTitleSlideItemComponent,
    NfxTitleListComponent,
    NfxTitleSlideItemDirective
  ],
  entryComponents: [
    NfxTitleSlideItemComponent
  ],
  providers: [
    TitleSlideService
  ]
})

export class NfxTitleSliderModule {}
