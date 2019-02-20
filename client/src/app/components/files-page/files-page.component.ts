import { Component, OnInit, ElementRef, ViewChild, Inject } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatChipInputEvent,
  MatAutocomplete,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTableDataSource,
  MatSnackBar
} from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FilesPageDialogComponent } from './files-page-dialog/files-page-dialog.component';
import { DelePageDialogComponent } from './dele-page-dialog/dele-page-dialog.component';
import { FileUploadDialogComponent } from './file-upload-dialog/file-upload-dialog.component';
import { DatasourceService } from '../../services/datasource.service';

export interface DialogData {
  animal: string;
  name: string;
  filter: string;
}

export interface DeleteDialog {}

@Component({
  selector: 'app-files-page',
  templateUrl: './files-page.component.html',
  styleUrls: [ './files-page.component.scss' ]
})
export class FilesPageComponent implements OnInit {
  dxfFiles: DXFFiles[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ ENTER, COMMA ];
  usersCtrl = new FormControl();
  filteredUsers: Observable<string[]>;
  users: string[] = [ 'Alexandr Semenets' ];
  allUsers: string[] = [ 'Alexandr Semenets', 'Maxim Pilipenko', 'Diana Gromenko' ];
  panelOpenState = false;
  dateUploaded: string[] = [
    'Anytime',
    'Yesturday',
    'Today',
    'This week',
    'Last week',
    'This month',
    'Last month',
    'Last 3 month'
  ];
  selectedRadio = 'Anytime';
  clickOnItem: number;
  sortBy: string;
  animal: string;
  name: string;
  filter: string;
  isCollapsed2 = false;
  items = [];
  dialogRef = true;
  fileToUpload: File = null;
  currentUser: any;

  @ViewChild('usersInput') usersInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(public dialog: MatDialog, private datasourceService: DatasourceService, private snackBar: MatSnackBar) {
    this.filteredUsers = this.usersCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => (fruit ? this._filter(fruit) : this.allUsers.slice()))
    );
    this.isCollapsed2 = true;
  }

  // get changRole() {
  //   switch (this.sortBy) {
  //     case 'uploadDate':
  //       return this.dxfFiles.sort((a, b) => {
  //         return <any>b.uploadDate - <any>a.uploadDate;
  //       });
  //     case 'name':
  //       return this.dxfFiles.sort((a, b) => {
  //         return a.name[0] > b.name[0] ? 1 : -1;
  //       });
  //     case 'size':
  //       return this.dxfFiles.sort((a, b) => {
  //         return <any>b.size[0] - <any>a.size[0];
  //       });
  //   }
  // }

  ngOnInit() {
    this.getUser();
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.users.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.usersCtrl.setValue(null);
    }
  }

  remove(user: string): void {
    const index = this.allUsers.indexOf(user);

    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.viewValue);
    this.usersInput.nativeElement.value = '';
    this.usersCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter((user) => user.toLowerCase().indexOf(filterValue) === 0);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(FilesPageDialogComponent, {
      width: '500px',
      data: { name: this.name, animal: this.animal, filter: this.filter },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      const res = { animal: result.animal, filter: result.filter };
      this.items.push(res);
      if (result) {
        // do confirmation actions
      }
      this.dialogRef = null;
    });
  }

  openFileUploadDialog() {
    const dialogRef = this.dialog.open(FileUploadDialogComponent, {
      width: '500px',
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: FormData) => {
      this.datasourceService.uploadDXFFile(this.currentUser, result).subscribe((res) => {
        console.log(res);
      });
      this.dialogRef = null;
    });
  }

  getUser() {
    this.datasourceService.getUser().subscribe((res) => {
      this.currentUser = res.value;
      this.getDXFFiles();
    });
  }

  openEditDialog() {
    const dialogRef = this.dialog.open(FilesPageDialogComponent, {
      width: '500px',
      data: { animal: this.items[this.clickOnItem].animal, filter: this.items[this.clickOnItem].filter },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const res = { animal: result.animal, filter: result.filter };
        this.items.splice(this.clickOnItem, 1, res);
      }
      this.dialogRef = null;
      this.clickOnItem = null;
    });
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(DelePageDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.items.splice(this.clickOnItem, 1);
      }
      this.clickOnItem = null;
    });
  }

  checkDeletePress(index) {
    this.clickOnItem = index;
  }

  getDXFFiles() {
    this.datasourceService.getDXFFiles(this.currentUser.tenantId).subscribe((res) => {
      console.log(res);
      this.dxfFiles = res.value;
    });
  }

  deleteDXF(id) {
    this.datasourceService.deleteDXFFile(id).subscribe((res) => {
      console.log(res);
      this.getDXFFiles();
    });
  }
}
export class DXFFiles {
  constructor(public name: string, public createdAt: number, public id: string) {}
}
