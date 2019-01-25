import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root-admin',
  templateUrl: './root-admin.component.html',
  styleUrls: ['./root-admin.component.scss']
})
export class RootAdminComponent implements OnInit {
  email: String = '';

  constructor() {
    // this.tenantRoles = [
    //   {label: 'tenant admin', value: 'admin'},
    //   {label: 'tenant user', value: 'user'}
    // ];
  }

  ngOnInit() {
  }

}
