import {
  Component,
  Renderer2,
  AfterViewInit
} from '@angular/core';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';

@Component({
  template: `
    <div class="browse-main" [ngClass]="{'theme-dark':!isKidProfile(), 'theme-light':isKidProfile()}">
      <nfx-main-header></nfx-main-header>
      <router-outlet></router-outlet>
      <nfx-footer></nfx-footer>
    </div>
  `,
  styleUrls: ['./browse-main.component.scss']
})
export class BrowseMainComponent implements AfterViewInit {
  constructor(
    private renderer: Renderer2,
    private profileInfoService: ProfileInfoServcie
  ) {}

  ngAfterViewInit() {
    this.renderer.removeClass(document.body, 'theme-gray');
    
    this.renderer.removeClass(document.body, 
      this.isKidProfile() ? 'theme-dark' : 'theme-light');

    this.renderer.addClass(document.body, 
      this.isKidProfile() ? 'theme-light' : 'theme-dark');
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }
}
