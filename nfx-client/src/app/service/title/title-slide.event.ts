import { TitleSlideItem } from '@nfxcommon/model/title-slide.item';
import { TitleSlideInfo } from '@nfxcommon/model/title-slide.info';

export class ItemCollapseEvent {
  constructor(
    public genreId: string = '',
    public itemIndex: number = -1,
    public currentPage: number = -1,
    public isOpened: boolean = false
  ) {}
}

export class ItemSelectedEvent {
  constructor(
    public genreId: string = '',
    public itemIndex: number = -1,
    public currentPage: number = -1
  ) {}
}

export class TitleSlideListUpdatedEvent {
  constructor(
    public titleSlideInfo: TitleSlideInfo = null
  ) {}
}
