import { MatDialogRef } from '@angular/material';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent implements OnInit {
  files: any;
  form: any = {};

  constructor(public dialogRef: MatDialogRef<FileUploadDialogComponent>) { }

  ngOnInit() {}

  addFile(event) {
    const target = event.target || event.srcElement;
    this.files = target.files;
  }

  onNoClick(): void {
    this.dialogRef.close(this.files);
  }
}
