import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import { BaseApi } from './core/base.api';
import {
  URI_GET_XSRF_TOKEN,
  XSRF_COOKIE_TOKEN
} from '@nfxcommon/common.define';
import { ExpressServer } from '../express.server';
import { HTTP_RES } from '../../common/http.define';


export class XsrfApi extends BaseApi {
  public registAPI(router: Router, csrfProtection: any, JWTAuth: any): void {
    router.get(
      URI_GET_XSRF_TOKEN,
      csrfProtection,
      (req, res, next) => { this.get(req, res, next); }
    );
  }

  protected get(req: Request, res: Response, next: NextFunction): void {
    res.cookie(
      XSRF_COOKIE_TOKEN,
      req.csrfToken(),
      {
        maxAge: ExpressServer.MAXAGE_XSRF_COOKIE,
        signed: true
      }
    );

    res.status(HTTP_RES.OK).send(true);
  }

  protected list(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  protected post(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  protected put(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  protected patch(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  protected delete(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }
}