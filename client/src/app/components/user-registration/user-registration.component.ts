import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
    myControl = new FormControl();
    options: string[] = ['Your favorite animal?', 'Your favorite color?', 'Three'];

    contactForm = new FormControl({
        fullname: ['', Validators.required],
        lastname: ['', Validators.required],
        tel: ['[ 0-9]+$', Validators.required],
        email: [Validators.required, Validators.email],
        answer: [Validators.required]
    });

    ngOnInit() {
    }

    fullname = new FormControl('', [Validators.required]);
    lastname = new FormControl('', [Validators.required]);
    email = new FormControl('', [Validators.required, Validators.email]);
    tel = new FormControl('', [Validators.required,Validators.pattern('[ 0-9]+$')]);
    answer  = new FormControl('', [Validators.required]);


        getErrorMessage() {
            return this.email.hasError('required') ? 'You must enter a value' :
                this.email.hasError('email') ? 'Not a valid email' :
                    '';
        }
            getErrorPhoneNumber(){
            return this.tel.hasError('required') ? 'You must enter a value' :
                this.tel.hasError('pattern') ? 'Not a valid Phone number' :
                    '';

    }


}
