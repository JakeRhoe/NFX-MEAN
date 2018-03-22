import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';

import { XsrfApi } from '../xsrf.api';
import { AccountApi } from '../account.api';
import { TitleSlideItemApi } from '../title-slide.item.api';
import { TitleSlideInfoApi } from '../title-slide.info.api';

import * as Debug from 'debug';
Debug.enable('API:NFX-CLONE');
const debug = Debug('API:NFX-CLONE');

export class NfxApi {
  constructor() {}

  public static create(router: Router, csrfProtection: any, JWTAuth: any) {
    new XsrfApi().registAPI(router, csrfProtection, JWTAuth);
    new AccountApi().registAPI(router, csrfProtection, JWTAuth);
    new TitleSlideItemApi().registAPI(router, csrfProtection, JWTAuth);
    new TitleSlideInfoApi().registAPI(router, csrfProtection, JWTAuth);
  }
}