import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NfxTitleSliderComponent } from './nfx-titleslider.component';

describe('NfxTitleSliderComponent', () => {
  let component: NfxTitleSliderComponent;
  let fixture: ComponentFixture<NfxTitleSliderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NfxTitleSliderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NfxTitleSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
