import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { DatasourceService } from '../../services/datasource.service';
import { IUserData } from '../../models/user.model'

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  user :IUserData;
  editProfileFormGroup :FormGroup;

  constructor(
    private _formBuilder :FormBuilder,
    private location :Location,
    private datasourceService :DatasourceService,
  ) { }

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
    this.getUser();
  }

  back() {
    this.location.back();
  }

  getUser() {
    this.datasourceService.getUser()
      .subscribe((res) => {
        this.user = res.value;

        this.editProfileFormGroup.controls['emailCtrl'].setValue(this.user.email || '');
        this.editProfileFormGroup.controls['firstNameCtrl'].setValue(this.user.firstname || '');
        this.editProfileFormGroup.controls['surnameCtrl'].setValue(this.user.lastname || '');
        this.editProfileFormGroup.controls['addressCtrl'].setValue(this.user.address || '');
        this.editProfileFormGroup.controls['phoneCtrl'].setValue(this.user.phoneNumber || '');
        this.editProfileFormGroup.controls['secretQuestionCtrl'].setValue(this.user.secretQuestionId || '');
        this.editProfileFormGroup.controls['roleCtrl'].setValue(this.getRole());

        if (!this.user.rootAdmin) {
          this.editProfileFormGroup.controls['roleCtrl'].disable();
        }
      });
  }

  getRole() {
    if (this.user.rootAdmin) {
      return 'root admin';
    }

    if (this.user.tenantAdmin) {
      return 'tenant admin';
    }

    return 'standart user';
  }
}
