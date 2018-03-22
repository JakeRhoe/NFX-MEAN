export const URI_GET_TITLE_SLIDE_INFO = '/api/title-slide.info/get';
export const URI_UPDATE_MY_LIST = '/api/mylist/update';
export const URI_DELETE_MY_LIST = '/api/mylist/delete';

export const SEARCH_TITLE_ID = '0';

import { TitleSlideItem } from './title-slide.item';

export interface TitleSlideInfoInterface {
  _id: any;
  genreId: string;
  genreText: string;
  isBigTitle: boolean;
  titleSlideList: string[] | TitleSlideItem[];
}

export class TitleSlideInfo implements TitleSlideInfoInterface {
  static readonly PARAM_GENRE_ID = 'genreId';
  static readonly PARAM_ACCOUNT_ID = 'accountId';
  static readonly PARAM_TITLE_ID = 'titleId';

  _id: any;
  genreId: string;
  genreText: string;
  isBigTitle: boolean;
  titleSlideList: string[] | TitleSlideItem[];

  constructor(
    _id: any = null,
    genreId: string = '',
    genreText: string = '',
    isBigTitle: boolean = false,
    titleSlideList: string[] | TitleSlideItem[] = null
  ) {
    this._id = _id;
    this.genreId = genreId;
    this.genreText = genreText;
    this.isBigTitle = isBigTitle;
    this.titleSlideList = titleSlideList;
  }
}
