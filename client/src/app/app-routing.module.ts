import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from 'src/app/components/login/login.component';
import { RootAdminComponent } from 'src/app/components/root-admin/root-admin.component';
import { UserRegistrationComponent } from 'src/app/components/user-registration/user-registration.component';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { DeleteUserComponent } from 'src/app/components/delete-user/delete-user.component';
import { FilesPageComponent } from 'src/app/components/files-page/files-page.component';
import { ViewPageComponent } from 'src/app/components/view-page/view-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { LoginGuard } from './login.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'root-admin-dashboard',
    component: RootAdminComponent,
    // canActivate: [LoginGuard]
  },
  {
    path: 'user-registration',
    component: UserRegistrationComponent
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'delete-user',
    component: DeleteUserComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'files-page',
    component: FilesPageComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'view-page',
    component: ViewPageComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
