export const URI_GET_HOME_TITLE = '/api/home-title/get';
export const URI_GET_NEW_TITLE_LIST = '/api/new-title-list/get';
export const URI_SEARCH_TITLE = '/api/search-title/get';


export interface TitleSlideItemInterface {
  _id: any;
  title: string;
  isNewTitle: boolean;
  matchRate: number;
  openYear: number;
  ratingGuide: string;
  runningTime: number;
  seasonNum: number;
  synopsis: string;
  imgFilename: string;
  bigImgFileName: string;
  imgRotator: string[];
  imgBigRotator: string[];
  starring: string[];
  director: string[];
  creator: string[];
  genres: string;
  imgOverview: string[];
  homeClipVideo: string;
  homeClipImg: string;
  homeTitleDescImg: string;
  homeTitleText: string;
  showHomeTitle: boolean;
  regDate: Date;
}

export class TitleSlideItem implements TitleSlideItemInterface {
  static readonly PARAM_SEARCHKEY = 'searchKey';
  _id: any;
  title: string;
  isNewTitle: boolean;
  matchRate: number;
  openYear: number;
  ratingGuide: string;
  runningTime: number;
  seasonNum: number;
  synopsis: string;
  imgFilename: string;
  bigImgFileName: string;
  imgRotator: string[];
  imgBigRotator: string[];
  starring: string[];
  director: string[];
  creator: string[];
  genres: string;
  imgOverview: string[];
  homeClipVideo: string;
  homeClipImg: string;
  homeTitleDescImg: string;
  homeTitleText: string;
  showHomeTitle: boolean;
  regDate: Date;

  constructor(
    _id: any = null,
    title: string = '',
    isNewTitle: boolean = false,
    matchRate: number = 0,
    openYear: number = 0,
    ratingGuide: string = '',
    runningTime: number = 0,
    seasonNum: number = 0,
    synopsis: string = '',
    imgFilename: string = '',
    bigImgFileName: string = '',
    imgRotator: string[] = null,
    imgBigRotator: string[] = null,
    starring: string[] = null,
    director: string[] = null,
    creator: string[] = null,
    genres: string = '',
    imgOverview: string[] = null,
    homeClipVideo: string = '',
    homeClipImg: string = '',
    homeTitleDescImg: string = '',
    homeTitleText: string = '',
    showHomeTitle: boolean = false,
    regDate: Date = new Date()
  ) {
    this._id = _id;
    this.title = title;
    this.isNewTitle = isNewTitle;
    this.matchRate = matchRate;
    this.openYear = openYear;
    this.ratingGuide = ratingGuide;
    this.runningTime = runningTime;
    this.seasonNum = seasonNum;
    this.synopsis = synopsis;
    this.imgFilename = imgFilename;
    this.bigImgFileName = bigImgFileName;
    this.imgRotator = imgRotator;
    this.imgBigRotator = imgBigRotator;
    this.starring = starring;
    this.director = director;
    this.creator = creator;
    this.genres = genres;
    this.imgOverview = imgOverview;
    this.homeClipVideo = homeClipVideo;
    this.homeClipImg = homeClipImg;
    this.homeTitleDescImg = homeTitleDescImg;
    this.homeTitleText = homeTitleText;
    this.showHomeTitle = showHomeTitle;
    this.regDate = regDate;
  }
}
