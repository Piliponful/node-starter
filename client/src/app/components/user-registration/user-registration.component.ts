import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasourceService } from '../../services/datasource.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
    formGroup: FormGroup;
    firstname = new FormControl('', [Validators.required]);
    lastname = new FormControl('', [Validators.required]);
    password = new FormControl('', [Validators.required]);
    phoneNumber = new FormControl('', [Validators.required, Validators.pattern('[ 0-9]+$')]);
    secretQuestionAnswer = new FormControl('', [Validators.required]);
    options: string[] = ['Your favorite animal?', 'Your favorite color?', 'Three'];
    hide = true;

    constructor(private _formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private datasourceService: DatasourceService,
        private router: Router,
        private snackBar: MatSnackBar) {}

    ngOnInit() {
        this.formGroup = this._formBuilder.group({
            firstname: ['', [Validators.minLength(3)]],
            lastname: ['', [Validators.minLength(3)]],
            password: ['', [Validators.minLength(3)]],
            phoneNumber: ['', [Validators.minLength(3)]],
            address: [''],
            city: [''],
            state: [''],
            secretQuestionId: [''],
            secretQuestionAnswer: ['', [Validators.minLength(3)]]
        });
    }

    getErrorPhoneNumber() {
        return this.formGroup.controls['phoneNumber'].hasError('required') ? 'You must enter a value' :
            this.formGroup.controls['phoneNumber'].hasError('pattern') ? 'Not a valid Phone number' :
            '';
    }

    onSubmit() {
        const data = Object.assign(this.formGroup.value);
        data['secretQuestionId'] = this.options.indexOf(this.formGroup.value.secretQuestionId);
        this.datasourceService.finishRegistration(this.route.queryParams['value'].code, data)
            .subscribe((res) => {
                    if (res && res.errors.length > 0) {
                        this.snackBar.open(res['errors'][0], '', { duration: 2000 });
                    } else {
                        this.router.navigateByUrl('/login');
                    }
                }
            );
    }
}
