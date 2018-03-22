import {
  Component,
  AfterViewInit,
  OnDestroy,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';

import { windowRefProvider, WINDOW_REF } from '../../service/window/window.service';

@Component({
  selector: 'nfx-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  providers: [ windowRefProvider ]
})
export class NotFoundComponent implements AfterViewInit, OnDestroy {
  private tmBackhome: number = null;

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private router: Router
  ) {}

  ngAfterViewInit() {
    this.tmBackhome = this.window.setTimeout(
      () => {
        this.router.navigate(['/']);
      }, 10000
    );
  }

  ngOnDestroy() {
    if (this.tmBackhome) {
      this.window.clearTimeout(this.tmBackhome);
    }
  }
}
