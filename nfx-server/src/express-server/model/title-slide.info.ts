import { TitleSlideInfoInterface } from '@nfxcommon/model/title-slide.info';
import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

const TitleSlideInfoSchema: Schema = new Schema({
  genreId: { type: String, index: true, unique: true },
  genreText: { type: String, default: 'My List' },
  isBigTitle: { type: Boolean, default: false },
  titleSlideList: [{ type: Schema.Types.ObjectId, ref: 'TitleSlideItem' }]
});

export interface TitleSlideInfoDoc extends TitleSlideInfoInterface, Document {}

export const TitleSlideInfoModel
= mongoose.model<TitleSlideInfoDoc>(
  'TitleSlideInfo',
  TitleSlideInfoSchema,
  'TitleSlideInfo'
);