import {
  InjectionToken,
  PLATFORM_ID,
  FactoryProvider
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


export const WINDOW_REF = new InjectionToken<Window>('WindowRef');

const windowRefFactory = (platformId: Object): Window => {
  if (isPlatformBrowser(platformId)) {
    return window;
  }

  return null;
};

export const windowRefProvider: FactoryProvider = {
  provide: WINDOW_REF,
  useFactory: windowRefFactory,
  deps: [ PLATFORM_ID ]
};
