import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';

export abstract class BaseApi {
  constructor() {}

  public abstract registAPI(router: Router, csrfProtection: any, JWTAuth: any): void;

  protected abstract get(req: Request, res: Response, next: NextFunction): void; 
  protected abstract list(req: Request, res: Response, next: NextFunction): void;
  protected abstract post(req: Request, res: Response, next: NextFunction): void;
  protected abstract put(req: Request, res: Response, next: NextFunction): void;
  protected abstract patch(req: Request, res: Response, next: NextFunction): void;
  protected abstract delete(req: Request, res: Response, next: NextFunction): void;
}
