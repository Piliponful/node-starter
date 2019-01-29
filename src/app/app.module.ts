import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { LoginComponent } from './components/login/login.component';
import { RootAdminComponent } from './components/root-admin/root-admin.component';
import { HeaderComponent } from './components/header/header.component';
import { InviteComponent } from './components/invite/invite.component';
import { TenantGroupsComponent } from './components/tenant-groups/tenant-groups.component';

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
  MatListModule
} from '@angular/material';
import { InviteDialogComponent } from './components/invite/invite-dialog/invite-dialog.component';
import { LoginHistoryComponent } from './components/login-history/login-history.component';

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
  ],
  imports: [
    BrowserModule,
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
    NoopAnimationsModule
  ],
  exports: [
    MatFormFieldModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  providers: [],
  entryComponents: [ InviteDialogComponent ],
  bootstrap: [AppComponent]
})
export class AppModule { }
