import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Inject,
  HostListener,
  ViewChild,
  ElementRef
} from '@angular/core';

import { windowRefProvider, WINDOW_REF } from '../../service/window/window.service';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';



@Component({
  selector: 'nfx-sub-header',
  templateUrl: './sub-header.component.html',
  styleUrls: ['./sub-header.component.scss'],
  providers: [ windowRefProvider ]
})
export class SubHeaderComponent implements OnInit, AfterViewInit {
  @ViewChild('subHeader', {read: ElementRef}) subHeader: ElementRef;
  @Input() genreText: string = '';

  public isFixedTop = false;

  private offsetTop: number = 0;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private profileInfoService: ProfileInfoServcie
  ) {}

  ngOnInit() {
    
  }

  ngAfterViewInit() {
    this.offsetTop = this.subHeader.nativeElement.getBoundingClientRect().y;
  }

  @HostListener('window:scroll', ['$event']) onWindowScroll(event: Event) {
    /*
    const clientHeight = this.window.document.body.clientHeight;
    const innerHeight = this.window.innerHeight;
    const subHeaderHeight = this.offsetTop;

    if ((clientHeight < innerHeight + 2 * subHeaderHeight) && 
    (this.window.scrollY >= this.offsetTop)) {
      this.isFixedTop = true;
    } else {
      this.isFixedTop = false;
    }

    this.isFixedTop = (this.window.scrollY >= this.offsetTop);
    */
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }
}
