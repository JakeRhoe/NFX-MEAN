import { AccountInterface } from '@nfxcommon/model/account';
import * as mongoose from 'mongoose';
import { Schema, Document } from 'mongoose';

const AccountSchema: Schema = new Schema({
  email: { type: String, index: true, unique: true, trim: true, minlength: 5 },
  pwd: { type: String, minlength: 4 },
  salt: { type: String }
});

export interface AccountDoc extends AccountInterface, Document {}

export const AccountModel
= mongoose.model<AccountDoc>(
  'Account',
  AccountSchema,
  'Account'
);