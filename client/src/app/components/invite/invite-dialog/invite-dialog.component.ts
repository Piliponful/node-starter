import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IDialogData } from '../../../models/dialog-data.model';
import { IUserData } from '../../../models/user.model';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent implements OnInit {
  user: IUserData;
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  dialogResult: IDialogData;

  myKeyup() {
    const emailField = this.firstFormGroup.controls['emailCtrl'].value;
    if (emailField) {
      const parseStr = emailField.split('@');
      if (parseStr && parseStr.length > 1) {
        const correctStr = parseStr[1].split('.');
        this.firstFormGroup.controls['tenantCtrl'].setValue(`${correctStr[0]}`);
      }
    }
  }

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData
  ) {
    this.user = data['user'];
  }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
      lastCtrl: ['', Validators.required],
      emailCtrl: ['', Validators.required],
      tenantCtrl: ['', Validators.required],
      roleCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      textareaCtrl: ['', Validators.required]
    });

    this.firstFormGroup.controls['firstCtrl'].setValue(this.data.firstName);
    this.firstFormGroup.controls['lastCtrl'].setValue(this.data.lastName);
    this.firstFormGroup.controls['emailCtrl'].setValue(this.data.email);
    this.firstFormGroup.controls['tenantCtrl'].setValue(this.data.tenant);
    this.firstFormGroup.controls['roleCtrl'].setValue(this.data.role);
    this.secondFormGroup.controls['textareaCtrl'].setValue(this.data.message);
  }

  submit(): void {
    this.dialogResult = {
      firstName: this.firstFormGroup.controls['firstCtrl'].value,
      lastName: this.firstFormGroup.controls['lastCtrl'].value,
      email: this.firstFormGroup.controls['emailCtrl'].value,
      tenant: this.firstFormGroup.controls['tenantCtrl'].value,
      role: this.firstFormGroup.controls['roleCtrl'].value,
      message: this.secondFormGroup.controls['textareaCtrl'].value
    };

    this.dialogRef.close(this.dialogResult);
  }
}
