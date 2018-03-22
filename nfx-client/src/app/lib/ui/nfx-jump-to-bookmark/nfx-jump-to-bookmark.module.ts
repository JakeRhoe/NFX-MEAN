import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NfxJumpToBookmarkDirective } from '../nfx-jump-to-bookmark/nfx-jump-to-bookmark.directive';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NfxJumpToBookmarkDirective
  ],
  exports: [
    NfxJumpToBookmarkDirective
  ]
})

export class NfxJumpToBookmarkModule {}
