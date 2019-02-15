import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelePageDialogComponent } from './dele-page-dialog.component';

describe('DelePageDialogComponent', () => {
  let component: DelePageDialogComponent;
  let fixture: ComponentFixture<DelePageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelePageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelePageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
