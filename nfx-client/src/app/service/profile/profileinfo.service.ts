import { Injectable } from '@angular/core';
import { Account } from '@nfxcommon/model/account';

@Injectable()
export class ProfileInfoServcie {
  public isKid = false;
  public account: Account = null;

  constructor() {}
}
