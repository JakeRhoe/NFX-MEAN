import {
  Router,
  Request,
  Response,
  NextFunction
} from 'express';
import { BaseApi } from './core/base.api';
import {
  TitleSlideItemModel,
  TitleSlideItemDoc
} from '../model/title-slide.item';
import {
  TitleSlideItem,
  URI_GET_HOME_TITLE,
  URI_GET_NEW_TITLE_LIST,
  URI_SEARCH_TITLE
} from '@nfxcommon/model/title-slide.item';
import { HTTP_RES } from '../../common/http.define';

import * as Debug from 'debug';
Debug.enable('API:TitleSlideItemApi');
const debug = Debug('API:TitleSlideItemApi');


export class TitleSlideItemApi extends BaseApi {
  public registAPI(router: Router, csrfProtection: any, JWTAuth: any): void {
    router.get(
      URI_GET_HOME_TITLE,
      JWTAuth,
      (req, res, next) => { this.getHomeTitle(req, res, next); });
    
    router.get(
      URI_GET_NEW_TITLE_LIST,
      JWTAuth,
      (req, res, next) => { this.getNewTitleList(req, res, next); });
    
    router.get(
      URI_SEARCH_TITLE,
      JWTAuth,
      (req, res, next) => { this.searchTitle(req, res, next); });
  }

  protected getHomeTitle(req: Request, res: Response, next: NextFunction): void {
    TitleSlideItemModel
    .find({ showHomeTitle: true })
    .limit(1)
    .sort({ regDate: -1 })
    .exec(function(err, arrayTitleSlideItem) {
      if (err) {
        res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
        return;
      }

      if (arrayTitleSlideItem === null || 
        arrayTitleSlideItem === undefined ||
        arrayTitleSlideItem.length < 1) {
        res.sendStatus(HTTP_RES.NO_CONTENT);
        return;
      }

      res.status(HTTP_RES.OK).json(arrayTitleSlideItem[0].toObject());
    });
  }

  protected getNewTitleList(req: Request, res: Response, next: NextFunction): void {
    TitleSlideItemModel
    .find({})
    .limit(10)
    .sort({ regDate: -1 })
    .exec(function(err, titleSlideItemList) {
      if (err) {
        res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
        return;
      }

      if (titleSlideItemList === null || 
        titleSlideItemList === undefined ||
        titleSlideItemList.length < 1) {
        res.sendStatus(HTTP_RES.NO_CONTENT);
        return;
      }

      res.status(HTTP_RES.OK).json(titleSlideItemList);
    });
  }

  protected searchTitle(req: Request, res: Response, next: NextFunction): void {
    const searchKey = req.header(TitleSlideItem.PARAM_SEARCHKEY);

    if (searchKey === undefined || searchKey === null) {
      res.sendStatus(HTTP_RES.ERR_BAD_REQUEST);
      return;
    }

    TitleSlideItemModel
    .find(
      {
        $or: [
          { title: { $regex: `.*${searchKey}.*`, $options: 'i' } },
          { starring: { $elemMatch: { $regex: `.*${searchKey}.*`, $options: 'i'} } },
          { director: { $elemMatch: { $regex: `.*${searchKey}.*`, $options: 'i'} } },
          { creator: { $elemMatch: { $regex: `.*${searchKey}.*`, $options: 'i'} } },
          { genres: { $regex: `.*${searchKey}.*`, $options: 'i' } }
        ]
      },
      function(err, slideItemList) {
        if (err) {
          res.sendStatus(HTTP_RES.ERR_INTER_SERVER);
          return;
        }

        if (slideItemList === null || slideItemList === undefined) {
          res.sendStatus(HTTP_RES.NO_CONTENT);
          return;
        }

        res.status(HTTP_RES.OK).json(slideItemList.map(slideItem => slideItem.toObject()));
      }
    );    
  }

  protected get(req: Request, res: Response, next: NextFunction): void {
    throw new Error("Method not implemented.");
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