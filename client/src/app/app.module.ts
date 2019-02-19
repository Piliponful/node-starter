import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
/** Material Modules */
import {
  MatInputModule,
  MatSidenavModule,
  MatMenuModule,
  MatIconModule,
  MatSelectModule,
  MatRadioModule,
  MatGridListModule,
  MatButtonModule,
  MatTabsModule,
  MatBadgeModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatDialogModule,
  MatStepperModule,
  MatSlideToggleModule,
  MatFormFieldModule,
  MatTreeModule,
  MatProgressBarModule,
  MatListModule,
  MatAutocompleteModule,
  MatCheckboxModule,
  MatCardModule,
  MatChipsModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatSnackBarModule
} from '@angular/material';
/** Components */
import { LoginComponent } from './components/login/login.component';
import { RootAdminComponent } from './components/root-admin/root-admin.component';
import { HeaderComponent } from './components/header/header.component';
import { InviteComponent } from './components/invite/invite.component';
import { TenantGroupsComponent } from './components/tenant-groups/tenant-groups.component';
import { InviteDialogComponent } from './components/invite/invite-dialog/invite-dialog.component';
import { LoginHistoryComponent } from './components/login-history/login-history.component';
import { UserRegistrationComponent } from './components/user-registration/user-registration.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { DeleteUserComponent } from './components/delete-user/delete-user.component';
import { FilesPageComponent } from './components/files-page/files-page.component';
import { ViewPageComponent } from './components/view-page/view-page.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { FilesPageDialogComponent } from './components/files-page/files-page-dialog/files-page-dialog.component';
import { DelePageDialogComponent } from './components/files-page/dele-page-dialog/dele-page-dialog.component';
import { DatasourceService } from './services/datasource.service';
import { AuthService } from './services/auth.service';
import { LoginGuard } from './login.guard';
import { FileUploadDialogComponent } from './components/files-page/file-upload-dialog/file-upload-dialog.component';

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        RootAdminComponent,
        HeaderComponent,
        InviteComponent,
        TenantGroupsComponent,
        InviteDialogComponent,
        LoginHistoryComponent,
        UserRegistrationComponent,
        EditProfileComponent,
        DeleteUserComponent,
        FilesPageComponent,
        ViewPageComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,
        FilesPageDialogComponent,
        DelePageDialogComponent,
        FileUploadDialogComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatInputModule,
        MatSidenavModule,
        MatMenuModule,
        MatIconModule,
        MatSelectModule,
        MatRadioModule,
        MatGridListModule,
        MatTabsModule,
        MatBadgeModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatDialogModule,
        MatStepperModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatTreeModule,
        MatProgressBarModule,
        MatListModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        MatCardModule,
        MatChipsModule,
        MatExpansionModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        NoopAnimationsModule
    ],
    exports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    entryComponents: [InviteDialogComponent, FilesPageDialogComponent, DelePageDialogComponent, FileUploadDialogComponent],
    bootstrap: [AppComponent],
    providers: [
        DatasourceService,
        AuthService,
        LoginGuard
    ]
})
export class AppModule { }
