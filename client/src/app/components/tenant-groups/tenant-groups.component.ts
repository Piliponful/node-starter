import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ITenantGroup } from '../../models/tenant-group.model';

@Component({
  selector: 'app-tenant-groups',
  templateUrl: './tenant-groups.component.html',
  styleUrls: ['./tenant-groups.component.scss']
})
export class TenantGroupsComponent implements OnInit {
  displayedColumns: string[] = ['Tenant Name', 'Tenant Admin', 'Accounts', 'DXF File', 'Annotation Files'];
  dataSource: MatTableDataSource<ITenantGroup>;
  tenantGroups: Array<ITenantGroup> = [
    {
      tenantName: 'Tenant 1',
      tenantAdmin: 'NameSurname 1',
      account: 3,
      dxfFile: 12,
      annotationFiles: 2
    },
    {
      tenantName: 'Tenant 4',
      tenantAdmin: 'NameSurname 4',
      account: 65,
      dxfFile: 4,
      annotationFiles: 5
    },
    {
      tenantName: 'Tenant 7',
      tenantAdmin: 'NameSurname 7',
      account: 93,
      dxfFile: 7,
      annotationFiles: 8
    },
    {
      tenantName: 'Tenant 10',
      tenantAdmin: 'NameSurname 10',
      account: 126,
      dxfFile: 10,
      annotationFiles: 11
    }
  ];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor() {
    this.dataSource = new MatTableDataSource(this.tenantGroups);
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onEditTenantAdmin(tenantGroup: ITenantGroup) {
    console.log('Test', tenantGroup);
  }
}

// export class TenantGroup implements ITenantGroup {
//   constructor(
//     private tenantName: string,
//     private tenantAdmin: string,
//     private account: string,
//     private dxfFile: string,
//     private annotationFiles: string
//   ) {}
// }
