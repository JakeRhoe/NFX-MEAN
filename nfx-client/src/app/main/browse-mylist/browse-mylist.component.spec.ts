import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseMylistComponent } from './browse-mylist.component';

describe('BrowseMylistComponent', () => {
  let component: BrowseMylistComponent;
  let fixture: ComponentFixture<BrowseMylistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseMylistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseMylistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
