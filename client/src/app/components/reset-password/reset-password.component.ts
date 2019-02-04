import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  hide = true;
  constructForm: FormGroup;

  constructor(public formBuilder: FormBuilder) {}

    ngOnInit() {
        this.constructForm = this.formBuilder.group({
            password1: ['', [Validators.minLength(3)]],
            // remember to replace RegisterComponent with YOUR class name
            password2: ['', [ResetPasswordComponent.matchFieldValidator('password1')]]
        })
    }


     static matchFieldValidator(fieldToMatch: string) : ValidatorFn {
            return (control : AbstractControl) : { [key: string]: any;} => {
                let confirmField = control.root.get(fieldToMatch);

                return (confirmField && control.value !== confirmField.value) ? {match:false} : null;
            }
        }
}
