import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';

import { ProfileGateComponent } from './profile-gate/profile-gate.component';


@NgModule({
  imports: [
    CommonModule,

    ProfileRoutingModule
  ],
  declarations: [ProfileGateComponent]
})

export class ProfileModule {}
