import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { InviteDialogComponent } from './invite-dialog/invite-dialog.component';
import { IUserData } from '../../models/user.model';
import { DatasourceService } from '../../services/datasource.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-invite',
  templateUrl: './invite.component.html',
  styleUrls: ['./invite.component.scss']
})
export class InviteComponent implements OnInit {
  displayedColumns = ['edit', 'firstname', 'lastname', 'tenantId', 'email', 'role'];
  dataSource :MatTableDataSource<IUserData>;
  users :IUserData[] = [];
  firstName :string;
  lastName :string;
  email :string;
  tenantId :string;
  role :string;
  message :string;
  user :IUserData;

  @ViewChild(MatPaginator) paginator :MatPaginator;
  @ViewChild(MatSort) sort :MatSort;
  @Input() userRole :string;

  constructor(
    public dialog :MatDialog,
    private datasourceService :DatasourceService,
    private snackBar :MatSnackBar,
  ) {}

  changRole(newValue) {
    this.getUsers();
    this.users = this.users.filter((user) => {
      return user.role === newValue;
    });
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngOnInit() {
    this.datasourceService.getUser()
      .subscribe(res => {
        this.user = res.value;

        if (this.user.tenantAdmin) {
          this.displayedColumns = ['edit', 'firstname', 'lastname', 'email'];
        }
      });
    this.getUsers();
  }

  applyFilter(filterValue :string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '685px',
      data: {
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        message: this.message,
        role: this.role,
        tenant: this.tenantId, // fixme: tenant should be passed with name
        user: this.user,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.datasourceService.inviteUser({
          email: result.email,
          firstname: result.firstName,
          lastname: result.lastName,
          message: result.message,
          tenantAdmin: result.role,
          tenantName: result.tenant,
        })
        .subscribe(res => {
          if (res && res.errors.length) {
            this.snackBar.open(res.errors[0], '', { duration: 2000 });
          }
        });
    });
  }

  getUsers() {
    return this.datasourceService.getUsers()
      .subscribe((res) => {
        if (res && res.errors.length) {
          this.snackBar.open(res.errors[0], '', { duration: 2000 });
        } else {
          const result = res['value'];
          result.forEach(element => {
            element['editable'] = false;
          });
          this.dataSource = new MatTableDataSource(result);
        }
      });
  }

  onEditable(row) {
    row.editable = !row.editable;
  }

  onEditUser(row) {
    row.editable = !row.editable;
    const id = row._id;
    delete row.editable;
    delete row._id;
    this.datasourceService.editUser(id, row)
      .subscribe((res) => {
        if (res && res['errors'].length > 0) {
          this.snackBar.open(res['errors'][0], '', { duration: 2000 });
        } else {
          this.getUsers();
        }
      });
  }
}
