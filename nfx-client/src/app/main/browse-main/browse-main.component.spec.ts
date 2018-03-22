import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseMainComponent } from './browse-main.component';

describe('BrowseMainComponent', () => {
  let component: BrowseMainComponent;
  let fixture: ComponentFixture<BrowseMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
