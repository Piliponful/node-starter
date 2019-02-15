import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {DeleteDialog, DialogData} from "../files-page.component";

@Component({
  selector: 'app-dele-page-dialog',
  templateUrl: './dele-page-dialog.component.html',
  styleUrls: ['./dele-page-dialog.component.scss']
})
export class DelePageDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<DelePageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    }

    onNoClick(): void {
        this.dialogRef.close();
    }


    ngOnInit() {
    }

    onSendDataToParent() {
        this.dialogRef.close({});
    }
}