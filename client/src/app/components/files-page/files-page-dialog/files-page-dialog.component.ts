import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DialogData} from "../files-page.component";

@Component({
  selector: 'app-files-page-dialog',
  templateUrl: './files-page-dialog.component.html',
  styleUrls: ['./files-page-dialog.component.scss']
})
export class FilesPageDialogComponent implements OnInit {
    constructor(
        public dialogRef: MatDialogRef<FilesPageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

    onNoClick(): void {
        this.dialogRef.close();
    }


  ngOnInit() {
  }

  onSendDataToParent() {
      this.dialogRef.close({
          animal: this.data.animal,
          filter: this.data.filter
      });
  }
}
