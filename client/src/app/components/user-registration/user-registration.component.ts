import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatasourceService } from '../../services/datasource.service';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
    formGroup: FormGroup;
    fullname = new FormControl('', [Validators.required]);
    lastname = new FormControl('', [Validators.required]);
    password = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required, Validators.email]);
    phoneNumber = new FormControl('', [Validators.required, Validators.pattern('[ 0-9]+$')]);
    secretQuestionAnswer = new FormControl('', [Validators.required]);
    options: string[] = ['Your favorite animal?', 'Your favorite color?', 'Three'];
    hide = true;

    constructor(private _formBuilder: FormBuilder, private route: ActivatedRoute, private datasourceService: DatasourceService) {}

    ngOnInit() {
        this.formGroup = this._formBuilder.group({
            fullname: ['', [Validators.minLength(3)]],
            lastname: ['', [Validators.minLength(3)]],
            password: ['', [Validators.minLength(3)]],
            email: ['', [Validators.minLength(3)]],
            phoneNumber: ['', [Validators.minLength(3)]],
            address: [''],
            city: [''],
            state: [''],
            secretQuestionId: [''],
            secretQuestionAnswer: ['', [Validators.minLength(3)]]
        });
    }

    getErrorMessage() {
        return this.formGroup.controls['email'].hasError('required') ? 'You must enter a value' :
            this.formGroup.controls['email'].hasError('email') ? 'Not a valid email' :
            '';
    }

    getErrorPhoneNumber() {
        return this.formGroup.controls['phoneNumber'].hasError('required') ? 'You must enter a value' :
            this.formGroup.controls['phoneNumber'].hasError('pattern') ? 'Not a valid Phone number' :
            '';
    }

    onSubmit() {
        this.datasourceService.finishRegistration(this.route.queryParams['value'].code, this.formGroup.value)
            .subscribe((res) => {
                    console.log(res);
                }
            );
    }
}
