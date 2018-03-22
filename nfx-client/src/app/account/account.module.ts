import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NfxFocusModule } from '../lib/ui/nfx-focus/nfx-focus.module';

import { BaseModule } from '../base/base.module';
import { AccountRoutingModule } from './account-routing.module';

import { AccountComponent } from './account.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NfxFocusModule,
    BaseModule,
    AccountRoutingModule
  ],
  declarations: [AccountComponent]
})
export class AccountModule { }
