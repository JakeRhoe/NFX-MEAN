import { Component, OnInit } from '@angular/core';
import { ProfileInfoServcie } from '../../service/profile/profileinfo.service';

@Component({
  selector: 'nfx-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor(private profileInfoService: ProfileInfoServcie) { }

  ngOnInit() {
  }

  isKidProfile() {
    return this.profileInfoService.isKid;
  }
}
