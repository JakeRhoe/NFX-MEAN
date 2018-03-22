import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NfxTitleListComponent } from './nfx-titlelist.component';

describe('NfxTitlelistComponent', () => {
  let component: NfxTitleListComponent;
  let fixture: ComponentFixture<NfxTitleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NfxTitleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NfxTitleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
