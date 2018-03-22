import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NfxPopoverComponent } from './nfx-popover';

describe('PopoverComponent', () => {
  let component: NfxPopoverComponent;
  let fixture: ComponentFixture<NfxPopoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NfxPopoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NfxPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
