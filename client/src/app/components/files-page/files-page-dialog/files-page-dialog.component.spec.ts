import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FilesPageDialogComponent } from './files-page-dialog.component';

describe('FilesPageDialogComponent', () => {
  let component: FilesPageDialogComponent;
  let fixture: ComponentFixture<FilesPageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FilesPageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilesPageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
