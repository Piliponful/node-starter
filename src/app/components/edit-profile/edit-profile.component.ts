import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  editProfileFormGroup: FormGroup;

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit() {
    this.editProfileFormGroup = this._formBuilder.group({
      emailCtrl: ['', Validators.required],
      firstNameCtrl: ['', Validators.required],
      surnameCtrl: ['', Validators.required],
      tenantCtrl: ['', Validators.required],
      groupCtrl: ['', Validators.required],
      roleCtrl: ['', Validators.required],
      addressCtrl: ['', Validators.required],
      phoneCtrl: ['', Validators.required],
      secretQuestionCtrl: ['', Validators.required],
    });
  }

}
