import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Inject
} from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { windowRefProvider, WINDOW_REF } from '../../service/window/window.service';

import { map, switchMap, tap } from 'rxjs/operators';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';


@Component({
  selector: 'nfx-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
  providers: [ windowRefProvider ]
})
export class ErrorComponent implements OnInit, AfterViewInit, OnDestroy {
  public errorStatus: string = '';
  private tmBackhome: number = null;  

  constructor(
    @Inject(WINDOW_REF) private window: Window,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.paramMap
    .switchMap((param: ParamMap) => {
      return Observable.of(param.get('status'));
    })
    .subscribe((status: string) => {
      this.errorStatus = status;
    });
  }

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
