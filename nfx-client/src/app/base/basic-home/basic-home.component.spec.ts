import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicHomeComponent } from './basic-home.component';

describe('BasicHomeComponent', () => {
  let component: BasicHomeComponent;
  let fixture: ComponentFixture<BasicHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasicHomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasicHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
