import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  headerStyle = {
    'width': '100%',
    'background-color': 'blue'
  };
  username: string;

  constructor(private authService: AuthService, private datasourceService: DatasourceService) { }

  ngOnInit() {
    this.datasourceService.getUser()
      .subscribe((res) => {
        this.username = `${res.value.firstname} ${res.value.lastname}`;
      });
  }

  logout() {
    this.authService.clear();
  }
}
