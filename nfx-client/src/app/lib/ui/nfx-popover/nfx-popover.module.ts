import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  NfxPopoverComponent,
  NfxPopoverDirective
} from './nfx-popover';


@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    NfxPopoverComponent,
    NfxPopoverDirective
  ],
  exports: [
    NfxPopoverComponent,
    NfxPopoverDirective
  ],
  entryComponents: [
    NfxPopoverComponent
  ]
})

export class NfxPopoverModule {}
