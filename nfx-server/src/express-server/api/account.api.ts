import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import { BaseApi } from './core/base.api';
import {
  AccountModel,
  AccountDoc
} from '../model/account';
import { TitleSlideInfoModel } from '../model/title-slide.info';
import {
  Account,
  URI_LOGIN,
  URI_GET_ACCOUNT,
  URI_EXIST_EMAIL,
  URI_CREATE_ACCOUNT,
  URI_UPDATE_ACCOUNT,
  URI_LOGOUT
} from '@nfxcommon/model/account';
import {
  NFX_ID,
  NFX_EMAIL,
  XSRF_COOKIE_TOKEN,
  JWT_AUTHTOKEN
} from '@nfxcommon/common.define';
import * as crypto from 'crypto';
import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { ObjectID } from 'bson';
import { ExpressServer } from '../express.server';
import { HTTP_RES } from '../../common/http.define';
const uidSafe = require('uid-safe');

import * as Debug from 'debug';
import { mongo } from 'mongoose';
Debug.enable('API:AccountApi');
const debug = Debug('API:AccountApi');


export class AccountApi extends BaseApi {
  private static readonly PBKDF_ITER: number = 10;
  private static readonly PBKDF_LENGTH: number = 32;
  private static readonly PBKDF_DIGEST: string = 'sha512';
  private static readonly MAXAGE_EMAIL_COOKIE: number = 1000 * 60 * 60 * 24 * 30;

  public registAPI(router: Router, csrfProtection: any, JWTAuth: any): void {
    router.get(
      `${URI_EXIST_EMAIL}/:${Account.PARAM_EMAIL}`,
      (req, res, next) => { this.getexistemail(req, res, next); }
    );

    router.post(
      URI_CREATE_ACCOUNT,
      csrfProtection,
      (req, res, next) => { this.post(req, res, next); }
    );

    router.get(
      URI_LOGIN,
      csrfProtection,
      (req, res, next) => { this.login(req, res, next); }
    );

    router.get(
      URI_GET_ACCOUNT,
      (req, res, next) => { this.getAccount(req, res, next); }
    );

    router.put(
      URI_UPDATE_ACCOUNT,
      JWTAuth,
      csrfProtection,
      (req, res, next) => { this.updateAccount(req, res, next); }
    );

    router.put(
      URI_LOGOUT,
      csrfProtection,
      (req, res, next) => { this.logout(req, res, next); }
    );
  }

  protected getexistemail(req: Request, res: Response, next: NextFunction): void {
    const PARAM_EMAIL: string = 'email';

    if (req.params[PARAM_EMAIL] === undefined) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    const email: string = req.params[PARAM_EMAIL];

    AccountModel.findOne(
      { email: { $regex: `^${email}$`, $options: 'i'} },
      function(err, account) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_NOT_FOUND);
          return;
        }

        let exist = true;

        if (account === null || account === undefined) {
          exist = false;
        }

        res.status(HTTP_RES.OK).json(exist);
      }
    );
  }

  protected post(req: Request, res: Response, next: NextFunction): void {
    const accountModel = new AccountModel(req.body);

    accountModel._id = new mongoose.mongo.ObjectId().toHexString();

    uidSafe(ExpressServer.SALT_BYTE_LENGTH).then(function(salt: string) {
      AccountApi.encryptPWD(
        accountModel._id, 
        accountModel.pwd, 
        res,
        salt,
        (derivedKey) => {
          accountModel.pwd = derivedKey;
          accountModel.salt = salt;
  
          accountModel.save(
            function(err, account) {
              if (err) {
                res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
                return;
              }
      
              AccountModel.findOne(
                { email: `${account.email}` },
                function(error, savedAccount) {
                  if (savedAccount) {
                    const titleSlideInfoModel = new TitleSlideInfoModel();
                    titleSlideInfoModel.genreId = savedAccount._id;
                    titleSlideInfoModel.save();
                  }
                }
              );

              account.salt = null;
      
              res.status(HTTP_RES.CREATED).json(account.toObject());
            }
          );
        }
      );
    });
  }

  protected login(req: Request, res: Response, next: NextFunction): void {
    const email = req.header(Account.PARAM_EMAIL);
    const pwd = req.header(Account.PARAM_PWD);

    if (email === undefined || email === null ||
    pwd === undefined || pwd === null) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    AccountModel.findOne(
      { email: `${email}` },
      function(err, accountDoc) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        if (accountDoc === null || accountDoc === undefined) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        AccountApi.encryptPWD(
          accountDoc._id,
          pwd,
          res,
          accountDoc.salt,
          (derivedKey) => {
            if (accountDoc.pwd !== derivedKey) {
              res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
              return;
            }

            res.cookie(
              NFX_EMAIL,
              accountDoc.email,
              {
                maxAge: AccountApi.MAXAGE_EMAIL_COOKIE
              }
            );

            req.session.regenerate((err) => {
              if (err) {
                res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
                return;
              }

              res.cookie(
                XSRF_COOKIE_TOKEN,
                req.csrfToken(),
                {
                  maxAge: ExpressServer.MAXAGE_XSRF_COOKIE,
                  signed: true
                }
              );

              jwt.sign(
                {
                  exp: ExpressServer.JWT_EXPIRESIN
                },
                ExpressServer.RSA_PRIVATE_KEY,
                {
                  algorithm: ExpressServer.JWT_ALGORITHM,
                  subject: (accountDoc._id as ObjectID).toHexString()
                },
                (err, authToken) => {
                  if (err) {
                    res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
                    return;
                  }

                  req.session[NFX_ID] = accountDoc._id;
                  accountDoc.salt = null;

                  res.setHeader(JWT_AUTHTOKEN, authToken);
                  res.status(HTTP_RES.OK).json(accountDoc.toObject());
                }
              );
            }); 
          }
        );
      }
    );
  }

  protected getAccount(req: Request, res: Response, next: NextFunction): void {
    const email = req.header(Account.PARAM_EMAIL);
    const pwd = req.header(Account.PARAM_PWD);
    
    if (email === undefined || email === null ||
    pwd === undefined || pwd === null) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    AccountModel.findOne(
      { email: `${email}` },
      function(err, account) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        if (account === null || account === undefined) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        AccountApi.encryptPWD(
          account._id,
          pwd,
          res,
          account.salt,
          (derivedKey) => {
            if (account.pwd !== derivedKey) {
              res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
              return;
            }

            account.salt = null;

            res.status(HTTP_RES.OK).json(account.toObject());
          }
        );
      }
    );
  }

  protected updateAccount(req: Request, res: Response, next: NextFunction): void {
    const reqAccount = req.body as Account;

    if (reqAccount === undefined || reqAccount === null) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    AccountModel.findById(
      mongoose.Types.ObjectId(reqAccount._id),
      function(err, account){
        if (err) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        AccountApi.encryptPWD(
          mongoose.Types.ObjectId(reqAccount._id),
          reqAccount.pwd,
          res,
          account.salt,
          (derivedKey) => {
            if (account.pwd !== derivedKey) {
              res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
              return;
            }

            uidSafe(ExpressServer.SALT_BYTE_LENGTH).then(function(salt: string) {
              if (reqAccount.newpwd &&
                reqAccount.newpwd.length > 0 &&
                reqAccount.newpwd !== reqAccount.pwd) {
                reqAccount.pwd = reqAccount.newpwd;
              }

              reqAccount.newpwd = '';

              AccountApi.encryptPWD(
                mongoose.Types.ObjectId(reqAccount._id),
                reqAccount.pwd,
                res,
                salt,
                (newDerivedKey) => {
                  reqAccount.pwd = newDerivedKey;

                  AccountModel.findByIdAndUpdate(
                    mongoose.Types.ObjectId(reqAccount._id),
                    {
                      email: reqAccount.email,
                      pwd: reqAccount.pwd,
                      salt: salt
                    },
                    function(err, saved) {
                      if (err) {
                        res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
                        return;
                      }

                      res.status(HTTP_RES.OK).send(JSON.stringify(reqAccount));
                    }
                  );
                }
              )
            });
          }
        );
    });
  }

  protected logout(req: Request, res: Response, next: NextFunction): void {
    const reqAccount = req.body as Account;

    if (reqAccount === undefined || reqAccount === null) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    AccountModel.findOne(
      {
        _id: mongoose.Types.ObjectId(reqAccount._id),
        pwd: reqAccount.pwd
      },
      function(err, account) {
        req.session.destroy(() => {
          res.sendStatus(HTTP_RES.OK);
          return;
        });
      }
    );
  }

  private static encryptPWD(
    id: ObjectID,
    pwd: string,
    res: Response,
    salt: string = null,
    callBack?: (derivedKey: string) => void
  ) {
    crypto.pbkdf2(
      pwd,
      id.toHexString() + salt,
      AccountApi.PBKDF_ITER,
      AccountApi.PBKDF_LENGTH,
      AccountApi.PBKDF_DIGEST,
      (err: Error, derivedKey: Buffer) => {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_UNAUTHORIZED);
          return;
        }

        if (callBack) {
          callBack(derivedKey.toString('hex'));
        }
      }
    );
  }

  protected get(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
  }

  protected list(req: Request, res: Response, next: NextFunction): void {
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