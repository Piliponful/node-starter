import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { DatasourceService } from '../../services/datasource.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnInit {
  deleteUsers: DeleteUser[] = [
    { firstname: 'Name 1', lastname: 'Surname 1', email: 'Email 1', accepted: '5 days ago', select: false },
    { firstname: 'Name 2', lastname: 'Surname 2', email: 'Email 2', accepted: '15 days ago', select: false },
    { firstname: 'Name 3', lastname: 'Surname 3', email: 'Email 3', accepted: '7 days ago', select: false },
    { firstname: 'Name 4', lastname: 'Surname 4', email: 'Email 4', accepted: '8 days ago', select: false },
  ];

  constructor(private location: Location, private datasourceService: DatasourceService,
    private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getUsers();
  }

  back() {
    this.location.back();
  }

  getUsers() {
    return this.datasourceService.getUsers()
      .subscribe((res) => {
        if (res && res['errors'].length > 0) {
          this.snackBar.open(res['errors'][0], '', { duration: 2000 });
        } else {
          let result = res.value;
          result.forEach(element => {
            element['select'] = false;
          });
          result = result.filter((item) => {
            return !item.rootAdmin;
          });
          this.deleteUsers = result;
        }
      });
  }

  onRestoreSelect() {
    this.deleteUsers.filter((user) => {
      user.select = false;
      return user;
    });
  }

  onDeleteUser() {
    const selectedUsers = this.deleteUsers.filter((user) => {
      return user.select;
    });
    if (selectedUsers.length > 1) {
      selectedUsers.filter((selectUser) => {
        this.datasourceService.deleteUser(selectUser['_id'])
          .subscribe((res) => {
            if (res && res['errors'].length > 0) {
              this.snackBar.open(res['errors'][0], '', { duration: 2000 });
            } else {
              this.getUsers();
            }
          });
      });
    } else {
      this.datasourceService.deleteUser(selectedUsers[0]['_id'])
        .subscribe((res) => {
          if (res && res['errors'].length > 0) {
            this.snackBar.open(res['errors'][0], '', { duration: 2000 });
          } else {
            this.getUsers();
          }
        });
    }
  }
}

export interface DeleteUser {
  firstname: string;
  lastname: string;
  email: string;
  accepted: string;
  select: boolean;
}
