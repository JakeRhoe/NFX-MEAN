import { TitleSlideItemInterface } from '@nfxcommon/model/title-slide.item';
import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';


const TitleSlideItemSchema: Schema = new Schema({
  title: { type: String, index: true, trim: true },
  isNewTitle: { type: Boolean },
  matchRate: { type: Number },
  openYear: { type: Number },
  ratingGuide: { type: String },
  runningTime: { type: Number },
  seasonNum: { type: Number },
  synopsis: { type: String },
  imgFilename: { type: String },
  bigImgFileName: { type: String },
  imgRotator: [{ type: String }],
  imgBigRotator: [{ type: String }],
  starring: [{ type: String, index: true }],
  director: [{ type: String, index: true }],
  creator: [{ type: String, index: true }],
  genres: { type: String, index: true },
  imgOverview: [{ type: String }],
  homeClipVideo: [{ type: String }],
  homeClipImg: [{ type: String }],
  homeTitleDescImg: [{ type: String }],
  homeTitleText: [{ type: String }],
  showHomeTitle: { type: Boolean },
  regDate: { type: Date, default: Date.now }
});

export interface TitleSlideItemDoc extends TitleSlideItemInterface, Document {}

export const TitleSlideItemModel
= mongoose.model<TitleSlideItemDoc>(
  'TitleSlideItem',
  TitleSlideItemSchema,
  'TitleSlideItem'
);