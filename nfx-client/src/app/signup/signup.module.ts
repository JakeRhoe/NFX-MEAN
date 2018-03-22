import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NfxFocusModule } from '../lib/ui/nfx-focus/nfx-focus.module';

import { BaseModule } from '../base/base.module';
import { SignupRoutingModule } from './signup-routing.module';

import { SignupComponent } from './signup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    NfxFocusModule,
    BaseModule,
    SignupRoutingModule
  ],
  declarations: [ SignupComponent ]
})
export class SignupModule { }
