import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    email = new FormControl('', [Validators.required, Validators.email]);
    password = new FormControl('', [Validators.required]);
    hide = true;
    form: FormGroup;
    constructor(public formBuilder: FormBuilder) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.minLength(3)]],
            // remember to replace RegisterComponent with YOUR class name
            password: ['', [Validators.minLength(3)]],

        })
    }



    getErrorMessage() {
        return this.email.hasError('required') ? 'You must enter a value' :
            this.email.hasError('email') ? 'Not a valid email' :
                '';
    }

}
