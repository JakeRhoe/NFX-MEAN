import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { WINDOW_REF, windowRefProvider } from '../../service/window/window.service';


@Component({
  selector: 'nfx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  providers: [ windowRefProvider ]
})
export class FooterComponent implements OnDestroy {
  private router: Router = null;
  private routerSubscription: Subscription = null;

  constructor(router: Router, @Inject(WINDOW_REF) private window: Window) {
    this.router = router;
    this.subscriptRouterEvent();
  }

  ngOnDestroy() {
    this.unSubscribeRouterEvent();
  }

  private subscriptRouterEvent() {
    if (!this.window) {
      return;
    }

    this.routerSubscription = this.router.events
      .subscribe((event) => {
        if (!(event instanceof NavigationEnd)) {
          return;
        }

        this.window.scrollTo(0, 0);
      }
    );
  }

  private unSubscribeRouterEvent() {
    if (!this.routerSubscription) {
      return;
    }

    this.routerSubscription.unsubscribe();
  }
}
