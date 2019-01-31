import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.scss']
})
export class LoginHistoryComponent implements OnInit {
  dataSource: MatTableDataSource<LoginHistoryData>;
  displayedColumns: string[] = ['edit', 'name', 'surname', 'tenant', 'lastLogin', 'lastActive', 'numbersLogin'];
  loginHistory: Array<LoginHistoryData> = [
    new LoginHistoryData('Edit1', 'TestName1', 'TestSurname1', 'TestTenant1', '13/12/2018 5:11PM', '14/12/2018 12:15AM', 1),
    new LoginHistoryData('Edit2', 'TestName2', 'TestSurname2', 'TestTenant2', '23/11/2018 3:14PM', '20/11/2018 4:30PM', 16),
    new LoginHistoryData('Edit3', 'TestName3', 'TestSurname3', 'TestTenant3', '20/11/2018 2:15PM', '20/11/2018 6:20AM', 106),
    new LoginHistoryData('Edit4', 'TestName4', 'TestSurname4', 'TestTenant4', 'Never Logged In', 'No Recently Activity', 0),
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(this.loginHistory);
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
}

export class LoginHistoryData {
  constructor(
    private edit: string,
    private name: string,
    private surname: string,
    private tenant: string,
    private lastLogin: string,
    private lastActive: string,
    private numbersLogin: number
  ) {}
}
