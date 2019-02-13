import { Component, OnInit, ViewChild } from '@angular/core';
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
  invite: string;
  inviteVariants: string[] = ['Tenant admin', 'Tenant User'];
  displayedColumns: string[] = ['edit', 'name', 'surname', 'tenant', 'email', 'group', 'role'];
  dataSource: MatTableDataSource<IUserData>;
  users: IUserData[] = [
    {
      edit: 'Edit1',
      name: 'TestName1',
      surname: 'TestSurname1',
      tenant: 'TestTenant1',
      email: 'TestEmail1',
      group: 'TestGroup1',
      role: 'Tenant Admin'
    },
    {
      edit: 'Edit2',
      name: 'TestName2',
      surname: 'TestSurname2',
      tenant: 'TestTenant2',
      email: 'TestEmail2',
      group: 'TestGroup2',
      role: 'Standart User 2'
    },
    {
      edit: 'Edit3',
      name: 'TestName3',
      surname: 'TestSurname3',
      tenant: 'TestTenant3',
      email: 'TestEmail3',
      group: 'TestGroup3',
      role: 'Standart User 3'
    },
    {
      edit: 'Edit4',
      name: 'TestName4',
      surname: 'TestSurname4',
      tenant: 'TestTenant4',
      email: 'TestEmail4',
      group: 'TestGroup4',
      role: 'Standart User 4'
    }
  ];
  firstName: string;
  lastName: string;
  email: string;
  tenant: string;
  role: string;
  group: string;
  addUsers = false;
  addGroups = false;
  message: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog, private datasourceService: DatasourceService,
    private snackBar: MatSnackBar) {
    this.dataSource = new MatTableDataSource(this.users);
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(InviteDialogComponent, {
      width: '685px',
      data: {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        tenant: this.tenant,
        role: this.role,
        group: this.group,
        addUsers: this.addUsers,
        addGroups: this.addGroups,
        message: this.message
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      const tenantAdmin = result['role'] === 'admin';
      this.datasourceService.inviteUser(result.firstName, result.lastName, result.email, tenantAdmin, result.tenant, result.message)
        .subscribe(
          (res) => {
              console.log(res);
          },
          (error) => this.snackBar.open(error.error.text, '', { duration: 2000 })
      );
    });
  }
}
