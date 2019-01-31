import { Component, OnInit } from '@angular/core';

export interface Section {
  text: string;
  isRead: boolean;
}

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.scss']
})
export class LoginHistoryComponent implements OnInit {
  messages: Section[] = [
    {
      text: 'you have a new message',
      isRead: false
    },
    {
      text: 'Message',
      isRead: true
    },
    {
      text: 'Message',
      isRead: true
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
