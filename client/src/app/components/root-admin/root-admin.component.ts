import { Component, OnInit } from '@angular/core';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-root-admin',
  templateUrl: './root-admin.component.html',
  styleUrls: ['./root-admin.component.scss']
})
export class RootAdminComponent implements OnInit {

  constructor(public datasourceService: DatasourceService) {}

  ngOnInit() {
    console.log(this.getUser());
  }

  getUser() {
    this.datasourceService.getUser()
      .subscribe((res) => {
        console.log('getUser', res);
      }
    );
  }
}
