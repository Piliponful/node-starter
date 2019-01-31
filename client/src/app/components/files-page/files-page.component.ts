import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocomplete } from '@angular/material';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-files-page',
  templateUrl: './files-page.component.html',
  styleUrls: ['./files-page.component.scss']
})
export class FilesPageComponent implements OnInit {
  dxfFiles: DXFFiles[] = [
    new DXFFiles('DXF File Example 1.dxf', 'Maksim Pilipenko', 'January 13', '62 KB'),
    new DXFFiles('DXF File Example 1.dxf', 'Maksim Pilipenko', 'January 3', '62 KB'),
    new DXFFiles('DXF File Example 1.dxf', 'Maksim Pilipenko', 'February 17', '62 KB')
  ];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  usersCtrl = new FormControl();
  filteredUsers: Observable<string[]>;
  users: string[] = ['Alexandr Semenets'];
  allUsers: string[] = ['Alexandr Semenets', 'Maxim Pilipenko', 'Diana Gromenko'];
  panelOpenState = false;
  dateUploaded: string[] = [
    'Anytime', 'Yesturday', 'Today', 'This week', 'Last week', 'This month', 'Last month', 'Last 3 month'
  ];
  selectedRadio = 'Anytime';

  @ViewChild('usersInput') usersInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor() {
    this.filteredUsers = this.usersCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.allUsers.slice()));
  }

  ngOnInit() {
  }

  add(event: MatChipInputEvent): void {
    // Add fruit only when MatAutocomplete is not open
    // To make sure this does not conflict with OptionSelected Event
    if (!this.matAutocomplete.isOpen) {
      const input = event.input;
      const value = event.value;

      // Add our fruit
      if ((value || '').trim()) {
        this.users.push(value.trim());
      }

      // Reset the input value
      if (input) {
        input.value = '';
      }

      this.usersCtrl.setValue(null);
    }
  }

  remove(user: string): void {
    const index = this.allUsers.indexOf(user);

    if (index >= 0) {
      this.users.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.users.push(event.option.viewValue);
    this.usersInput.nativeElement.value = '';
    this.usersCtrl.setValue(null);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allUsers.filter(user => user.toLowerCase().indexOf(filterValue) === 0);
  }
}

export class DXFFiles {
  constructor(
    private name: string,
    private author: string,
    private uploadDate: string,
    private size: string
  ) {}
}