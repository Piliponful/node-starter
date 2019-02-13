import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

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

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  logout() {
    this.authService.clear();
  }
}
