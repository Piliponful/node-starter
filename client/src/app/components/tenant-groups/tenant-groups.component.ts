import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { ITenantGroup } from '../../models/tenant-group.model';
import { DatasourceService } from '../../services/datasource.service';
import { MatSnackBar } from '@angular/material';
import { FileUploadDialogComponent } from '../files-page/file-upload-dialog/file-upload-dialog.component';

@Component({
  selector: 'app-tenant-groups',
  templateUrl: './tenant-groups.component.html',
  styleUrls: ['./tenant-groups.component.scss']
})
export class TenantGroupsComponent implements OnInit {
  // displayedColumns: string[] = ['name', 'Tenant Admin', 'usersCount', 'dxfFilesCount', 'anotationFilesCount'];
  displayedColumns: string[] = ['name', 'usersCount', 'dxfFilesCount', 'anotationFilesCount'];
  dataSource: MatTableDataSource<ITenantGroup>;
  tenantGroups: Array<ITenantGroup> = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private datasourceService: DatasourceService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog) {
    this.dataSource = new MatTableDataSource(this.tenantGroups);
  }

  ngOnInit() {
    this.getTenants();
  }

  onEditTenantAdmin(tenantGroup: ITenantGroup) {
    console.log('Test', tenantGroup);
  }

  getTenants() {
    this.datasourceService.getTenants()
      .subscribe((res) => {
        if (res && res['errors'].length > 0) {
          this.snackBar.open(res['errors'][0], '', { duration: 2000 });
        } else {
          this.tenantGroups = res.value;
          this.dataSource = new MatTableDataSource(this.tenantGroups);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      });
  }

  openUploadDXFFileDialog(id) {
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      width: '685px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.datasourceService.uploadDXFFile(id, result).subscribe((res) => {
        if (res && res.errors.length > 0) {
          this.snackBar.open(res['errors'][0], '', { duration: 2000 });
        } else {
          this.getTenants();
        }
      });
    });
  }
}
