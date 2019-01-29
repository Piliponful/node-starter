import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from 'src/app/components/login/login.component';
import { RootAdminComponent } from 'src/app/components/root-admin/root-admin.component';
import { UserRegistrationComponent } from 'src/app/components/user-registration/user-registration.component';
import { EditProfileComponent } from 'src/app/components/edit-profile/edit-profile.component';
import { DeleteUserComponent } from 'src/app/components/delete-user/delete-user.component';

const routes: Routes = [
  { path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'root-admin-dashboard',
    component: RootAdminComponent
  },
  {
      path: 'user-registration',
      component: UserRegistrationComponent
  },
  {
    path: 'edit-profile',
    component: EditProfileComponent
  },
  {
    path: 'delete-user',
    component: DeleteUserComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
