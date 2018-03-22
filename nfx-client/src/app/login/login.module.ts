import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NfxFocusModule } from '../lib/ui/nfx-focus/nfx-focus.module';

import { BaseModule } from '../base/base.module';
import { LoginRoutingModule } from './login-routing.module';

import { LoginComponent } from './login.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NfxFocusModule,
    BaseModule,
    LoginRoutingModule
  ],
  declarations: [ LoginComponent ]
})

export class LoginModule {}
