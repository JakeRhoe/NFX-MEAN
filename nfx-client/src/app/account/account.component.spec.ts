import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Directive } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AccountComponent } from './account.component';
import { RouterLinkDirectiveStub } from '../../testing';

import { windowRefProvider, WINDOW_REF } from '../service/window/window.service';
import { AccountService } from '../service/account/account.service';
import { ProfileInfoServcie } from '../service/profile/profileinfo.service';

@Directive({ selector: '[nfxSetFocus]', exportAs: 'nfxSetFocus' })
class NfxFocusDirective {}

@Component({ selector: 'nfx-footer', template: '' })
export class FooterComponent {}


describe('AccountComponent', () => {
  let component: AccountComponent;
  let fixture: ComponentFixture<AccountComponent>;
  const routerSpy = createRouterSpy();
  let accountServiceStub: Partial<AccountService>;
  let profileServiceStub: Partial<ProfileInfoServcie>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule ],
      declarations: [
        NfxFocusDirective,
        RouterLinkDirectiveStub,
        FooterComponent,
        AccountComponent
      ],
      providers: [
        windowRefProvider,
        { provide: Router,              useValue: routerSpy},
        { provide: AccountService,      useValue: accountServiceStub },
        { provide: ProfileInfoServcie,  useValue: profileServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

function createRouterSpy() {
  return jasmine.createSpyObj('Router', ['navigate']);
}

