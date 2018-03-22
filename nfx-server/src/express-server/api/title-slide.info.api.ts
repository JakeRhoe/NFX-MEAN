import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import { BaseApi } from './core/base.api';
import {
  TitleSlideInfoModel,
  TitleSlideInfoDoc
} from '../model/title-slide.info';
import {
  TitleSlideInfo,
  URI_GET_TITLE_SLIDE_INFO,
  URI_UPDATE_MY_LIST,
  URI_DELETE_MY_LIST
} from '@nfxcommon/model/title-slide.info';
import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';
import { TitleSlideItem } from '../../../../nfx-common/model/title-slide.item';
import { HTTP_RES } from '../../common/http.define';

import * as Debug from 'debug';
Debug.enable('API:TitleSlideInfoApi');
const debug = Debug('API:TitleSlideInfoApi');


export class TitleSlideInfoApi extends BaseApi {
  public registAPI(router: Router, csrfProtection: any, JWTAuth: any): void {
    router.get(
      `${URI_GET_TITLE_SLIDE_INFO}/:${TitleSlideInfo.PARAM_GENRE_ID}`,
      JWTAuth,
      (req, res, next) => { this.get(req, res, next); });

    router.put(
      URI_UPDATE_MY_LIST,
      JWTAuth,
      csrfProtection,
      (req, res, next) => { this.updateMyList(req, res, next); });
    
    router.delete(
      URI_DELETE_MY_LIST,
      JWTAuth,
      csrfProtection,
      (req, res, next) => { this.deleteMyList(req, res, next); });
  }
  
  protected get(req: Request, res: Response, next: NextFunction): void {
    if (req.params[TitleSlideInfo.PARAM_GENRE_ID] === undefined) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    const genreId: string = req.params[TitleSlideInfo.PARAM_GENRE_ID];    

    TitleSlideInfoModel
    .findOne({ genreId: `${genreId}` })
    .populate({ path: 'titleSlideList' })
    .exec(function(err, titleSlideInfo) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
          return;
        }

        if (titleSlideInfo === null || titleSlideInfo === undefined) {
          res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
          return;
        }
       
        res.status(HTTP_RES.OK).json(titleSlideInfo.toObject());
      }
    );
  }

  protected updateMyList(req: Request, res: Response, next: NextFunction): void {
    const genreId = req.header(TitleSlideInfo.PARAM_ACCOUNT_ID);
    const titleId = req.header(TitleSlideInfo.PARAM_TITLE_ID);

    TitleSlideInfoModel
    .findOne(
      { genreId: `${genreId}` },
      function(err, titleSlideInfo) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
          return;
        }

        if (titleSlideInfo === null || titleSlideInfo === undefined) {
          res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
          return;
        }

        let updatedSlideInfo: TitleSlideInfoDoc = titleSlideInfo;

        if (titleSlideInfo.titleSlideList) {          
          const slideList: string[] = titleSlideInfo.titleSlideList as string[];          
          if (slideList.indexOf(titleId) < 0) {
            slideList.push(titleId);

            titleSlideInfo.save(function(err, titleSlideInfo){
              if (err) {
                res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
                return;
              }
      
              if (titleSlideInfo === null || titleSlideInfo === undefined) {
                res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
                return;
              }

              updatedSlideInfo = titleSlideInfo;
            });
          }
        }

        updatedSlideInfo
        .populate({ path: 'titleSlideList' }, function(err, titleSlideInfo) {
          if (err) {
            res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
            return;
          }

          if (titleSlideInfo === null || titleSlideInfo === undefined) {
            res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
            return;
          }
        
          res.status(HTTP_RES.OK).json(titleSlideInfo.toObject());
        });
      }
    );
  }

  protected deleteMyList(req: Request, res: Response, next: NextFunction): void {
    const genreId = req.header(TitleSlideInfo.PARAM_ACCOUNT_ID);
    const titleId = req.header(TitleSlideInfo.PARAM_TITLE_ID);

    TitleSlideInfoModel
    .findOneAndUpdate(
      { genreId: `${genreId}` },
      { $pullAll: { titleSlideList: [mongoose.Types.ObjectId(titleId)] }},
      function(err, titleSlideInfo) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
          return;
        }

        if (titleSlideInfo === null || titleSlideInfo === undefined) {
          res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
          return;
        }

        TitleSlideInfoModel
        .findOne({ genreId: `${genreId}` })
        .populate({ path: 'titleSlideList' })
        .exec(function(err, updated) {
          if (err) {
            res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
            return;
          }

          if (updated === null || updated === undefined) {
            res.sendStatus(HTTP_RES.ERR_FORBIDDEN);
            return;
          }
        
          res.status(HTTP_RES.OK).json(updated.toObject());
        });
      }
    );
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