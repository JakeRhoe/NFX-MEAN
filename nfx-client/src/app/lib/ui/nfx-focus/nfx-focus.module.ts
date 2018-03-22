import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NfxFocusDirective } from '../nfx-focus/nfx-focus.directive';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NfxFocusDirective
  ],
  exports: [
    NfxFocusDirective
  ]
})

export class NfxFocusModule {}
