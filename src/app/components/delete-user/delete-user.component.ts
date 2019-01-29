import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnInit {
  deleteUsers: DeleteUser[] = [
    { name: 'Name 1', surname: 'Surname 1', email: 'Email 1', accepted: '5 days ago', select: false },
    { name: 'Name 2', surname: 'Surname 2', email: 'Email 2', accepted: '15 days ago', select: false },
    { name: 'Name 3', surname: 'Surname 3', email: 'Email 3', accepted: '7 days ago', select: false },
    { name: 'Name 4', surname: 'Surname 4', email: 'Email 4', accepted: '8 days ago', select: false },
  ];

  constructor() { }

  ngOnInit() {
  }

}

export interface DeleteUser {
  name: string;
  surname: string;
  email: string;
  accepted: string;
  select: boolean;
}
