import { Component, OnInit } from '@angular/core';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-root-admin',
  templateUrl: './root-admin.component.html',
  styleUrls: ['./root-admin.component.scss']
})
export class RootAdminComponent implements OnInit {
  currentUser: {};
  userRole: string;

  constructor(private datasourceService: DatasourceService) {}

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.datasourceService.getUser()
      .subscribe((res) => {
        this.currentUser = res.value;
        this.checkUserRole();
      });
  }

  checkUserRole() {
    if (this.currentUser['rootAdmin']) {
      this.userRole = 'Root Admin';
    } else if (!this.currentUser['rootAdmin'] && this.currentUser['tenantAdmin']) {
      this.userRole = 'Tenant Admin';
    } else {
      this.userRole = 'Standart User';
    }
  }
}
