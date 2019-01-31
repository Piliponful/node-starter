import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { IDialogData } from '../../../models/dialog-data.model';

@Component({
  selector: 'app-invite-dialog',
  templateUrl: './invite-dialog.component.html',
  styleUrls: ['./invite-dialog.component.scss']
})
export class InviteDialogComponent implements OnInit {
  isLinear = true;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  selectedGroup: string;
  groups: string[] = ['All groups', 'Group 1', 'Group 2', 'Group 3', 'Group 4'];
  dialogResult: IDialogData;
  showAddNewGroupField = false;
  newGroupName: string;

  constructor(
    private _formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<InviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IDialogData
  ) { }

  ngOnInit() {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
      lastCtrl: ['', Validators.required],
      emailCtrl: ['', Validators.required],
      tenantCtrl: ['', Validators.required],
      roleCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      groupCtrl: [''],
      addUsersCtrl: [''],
      addGroupsCtrl: ['']
    });
    this.thirdFormGroup = this._formBuilder.group({
      textareaCtrl: ['', Validators.required]
    });

    this.firstFormGroup.controls['firstCtrl'].setValue(this.data.firstName);
    this.firstFormGroup.controls['lastCtrl'].setValue(this.data.lastName);
    this.firstFormGroup.controls['emailCtrl'].setValue(this.data.email);
    this.firstFormGroup.controls['tenantCtrl'].setValue(this.data.tenant);
    this.firstFormGroup.controls['roleCtrl'].setValue(this.data.role);

    this.secondFormGroup.controls['groupCtrl'].setValue(this.data.group);
    this.secondFormGroup.controls['addUsersCtrl'].setValue(this.data.addUsers);
    this.secondFormGroup.controls['addGroupsCtrl'].setValue(this.data.addGroups);

    this.thirdFormGroup.controls['textareaCtrl'].setValue(this.data.message);
  }

  submit(): void {
    this.dialogResult = {
      firstName: this.firstFormGroup.controls['firstCtrl'].value,
      lastName: this.firstFormGroup.controls['lastCtrl'].value,
      email: this.firstFormGroup.controls['emailCtrl'].value,
      tenant: this.firstFormGroup.controls['tenantCtrl'].value,
      role: this.firstFormGroup.controls['roleCtrl'].value,
      group: this.secondFormGroup.controls['groupCtrl'].value,
      addUsers: this.secondFormGroup.controls['addUsersCtrl'].value,
      addGroups: this.secondFormGroup.controls['addGroupsCtrl'].value,
      message: this.thirdFormGroup.controls['textareaCtrl'].value
    };
    this.dialogRef.close(this.dialogResult);
  }

  onShowNewGroupField() {
    this.showAddNewGroupField = true;
  }

  onAddNewGroup() {
    this.groups.push(this.newGroupName);
    this.showAddNewGroupField = false;
    this.newGroupName = '';
  }
}
