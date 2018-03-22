import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../service/auth/auth-guard.service';
import { ProfileGateComponent } from './profile-gate/profile-gate.component';

const profileRoutes: Routes = [
    {
        path: '',
        component: ProfileGateComponent,
        canActivate: [AuthGuard]
    }
];


@NgModule({
    imports: [
        RouterModule.forChild(profileRoutes)
    ],
    exports: [
        RouterModule
    ]
})

export class ProfileRoutingModule {}
