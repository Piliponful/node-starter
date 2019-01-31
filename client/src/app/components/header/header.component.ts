import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
    // this.items = [{
    //   label: 'root admin',
    //   items: [
    //       {label: 'Dashboard', icon: 'fa fa-plus'},
    //       {label: 'Logout', icon: 'fa fa-download'}
    //   ]
    // }];
  }

}
