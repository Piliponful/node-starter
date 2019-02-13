import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material';

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

    constructor(public formBuilder: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private snackBar: MatSnackBar) {}

    ngOnInit() {
        this.form = this.formBuilder.group({
            email: ['', [Validators.minLength(3)]],
            password: ['', [Validators.minLength(3)]],
        });
    }

    getErrorMessage() {
        return this.email.hasError('required') ? 'You must enter a value' :
            this.email.hasError('email') ? 'Not a valid email' :
                '';
    }

    onSubmit() {
        this.authService.authenticate(this.form.controls['email'].value, this.form.controls['password'].value)
            .subscribe((res) => {
                    if (res['error']) {
                        this.snackBar.open(res['error'], '', { duration: 2000 });
                    } else {
                        this.router.navigateByUrl('/root-admin-dashboard');
                    }
                }
            );
    }
}
