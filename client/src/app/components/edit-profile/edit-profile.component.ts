import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']
})
export class EditProfileComponent implements OnInit {
  editProfileFormGroup: FormGroup;
  userRole = 'Root Admin';

  constructor(private _formBuilder: FormBuilder, private location: Location, private datasourceService: DatasourceService) { }

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
        this.editProfileFormGroup.controls['emailCtrl'].setValue(`${res.value.email}`);
        this.editProfileFormGroup.controls['firstNameCtrl'].setValue(`${res.value.firstname}`);
        this.editProfileFormGroup.controls['surnameCtrl'].setValue(`${res.value.lastname}`);
        this.editProfileFormGroup.controls['addressCtrl'].setValue(`${res.value.address}`);
        this.editProfileFormGroup.controls['phoneCtrl'].setValue(`${res.value.phoneNumber}`);
        this.editProfileFormGroup.controls['secretQuestionCtrl'].setValue(`${res.value.secretQuestionId}`);
      });
  }
}
