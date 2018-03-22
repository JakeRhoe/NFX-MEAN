import * as express from 'express';
import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import * as cors from "cors";
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as morgan from 'morgan';
import * as mongoose from 'mongoose';
import * as bluebird from 'bluebird';
import * as errorHandler from 'errorhandler';
import {
  NFX_ID,
  JWT_AUTHORIZATION,
  JWT_AUTHTOKEN,
  XSRF_SESSION_KEY,
  XSRF_COOKIE_TOKEN
} from '@nfxcommon/common.define';
import * as session from 'express-session';
import * as connectMongo from 'connect-mongo';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import { NfxApi } from './api/core/nfx.api';
import { WebServer } from '../web-server/web.server';
import { HTTP_RES } from '../common/http.define';
const uidSafe = require('uid-safe');

import * as Debug from 'debug';
Debug.enable('Express-Server:NFX-CLONE');
const debug = Debug('Express-Server:NFX-CLONE');


export class ExpressServer {
  public static readonly RSA_PRIVATE_KEY = fs.readFileSync('./dist/server/key/jwtRS256.key');  
  public static readonly MAXAGE_XSRF_COOKIE: number = 1000 * 60 * 5;
  public static readonly JWT_ALGORITHM = 'RS256';
  public static readonly JWT_EXPIRESIN: number = Math.floor(Date.now() / 1000) + 60 * 60;
  public static readonly SALT_BYTE_LENGTH: number = 24;

  private app: express.Application = null;
  private readonly MONGODB_URIS = fs.readFileSync('./dist/server/dbcon/mongo.con').toString();
  private readonly RSA_PUBLIC_KEY = fs.readFileSync('./dist/client/assets/key/jwtRS256.key.pub');
  private readonly SESSION_MAXAGE: number = 1000 * 60 * 60;
  private readonly COOKIE_SALT: string = uidSafe.sync(ExpressServer.SALT_BYTE_LENGTH);
  

  constructor() {}

  public startServer(callback: (err: Error) => any) {
    debug('Starting server');
    this.initDB(callback);
  }

  public getApp(): express.Application {
    return this.app;
  }

  private initDB(callback: (err: Error) => any) {
    mongoose.connect(this.MONGODB_URIS,
      {
        promiseLibrary: bluebird
      }
    )
    .then(() => {
      debug('mongoDB connected');
      this.initServer();
      this.initRouter();
      callback(null);
    })
    .catch((err) => {
      debug(`mongoDB failed to connect[error: ${err}]`);
      callback(err);
    });
  }

  private initServer() {
    this.app = express();
    
    this.app.use(morgan('dev'));
    this.app.use(cookieParser(this.COOKIE_SALT));
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    const MongoStore = connectMongo(session);

    this.app.use(
      session(
        {
          secret: this.COOKIE_SALT,
          resave: false,
          saveUninitialized: true,
          cookie: {
            httpOnly: false,
            maxAge: this.SESSION_MAXAGE,
            signed: true
          },
          store: new MongoStore({ mongooseConnection: mongoose.connection })
        }
      )
    );
  }

  private setCORS(router: Router) {
    const corsOptions: cors.CorsOptions = {
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token"
      ],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      // origin: "http://localhost:4200",
      preflightContinue: false
    };

    router.use(cors(corsOptions));
  }

  private getCSRF(): any {
    const csrfProtection = csurf({
      cookie: false,
      sessionKey: XSRF_SESSION_KEY,
      value: (req: Request) => req.signedCookies[XSRF_COOKIE_TOKEN]
    });

    return csrfProtection;
  }

  private getJWT(): any {
    const JWTAuth = (req: Request, res: Response, next: NextFunction) => {
      const authToken = req.header(JWT_AUTHORIZATION);
      const nfxid = req.header(NFX_ID);

      jwt.verify(
        authToken,
        this.RSA_PUBLIC_KEY,
        { 
          algorithms: [ExpressServer.JWT_ALGORITHM],
          subject: nfxid,
          clockTolerance: 5,
          clockTimestamp: Math.floor(Date.now() / 1000)
        },
        (err, payload) => {
          if (err) {
            if (err instanceof jwt.TokenExpiredError) {
              if (req.session[NFX_ID] as string !== nfxid) {                
                next(err);
                return;
              }

              jwt.sign(
                {
                  exp: ExpressServer.JWT_EXPIRESIN
                },
                ExpressServer.RSA_PRIVATE_KEY,
                {
                  algorithm: ExpressServer.JWT_ALGORITHM,
                  subject: nfxid
                },
                (err, newAuthToken) => {
                  if (err) {
                    next(err);
                    return;
                  }

                  res.setHeader(JWT_AUTHTOKEN, newAuthToken);
                }
              );

            } else {
              next(err);
              return;
            }
          }

          next();
        }
      );
    }

    return JWTAuth;
  }

  private setHTTPS() {
    this.app.use(function(req, res, next) {
      if (req.secure) {
        return next();
      }
      
      res.redirect("https://" + req.headers.host + req.url);
    });
  }

  private initRouter() {
    path.resolve();

    if (WebServer.ENABLE_HTTPS) {
      this.setHTTPS();
    }

    this.app.use(
      express.static(path.join(__dirname, '../../', 'client'))
    );

    const router = express.Router();

    this.setCORS(router);

    NfxApi.create(router, this.getCSRF(), this.getJWT());

    this.app.use('/', router);

    this.app.use(
      '*',
      express.static(path.join(__dirname, '../../', 'client/index.html'))
    );

    this.app.use(
      (err: any, req: Request, res: Response, next: NextFunction) => {
        err.status = (err instanceof jwt.JsonWebTokenError) ?
          HTTP_RES.ERR_UNAUTHORIZED : err.status;
        
        next(err);
      }
    );

    this.app.use(errorHandler());
  }
}