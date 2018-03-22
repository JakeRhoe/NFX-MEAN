export const URI_LOGIN = '/api/account/login';
export const URI_LOGOUT = '/api/account/logout';
export const URI_GET_ACCOUNT = '/api/account/get';
export const URI_EXIST_EMAIL = '/api/account/exist';
export const URI_CREATE_ACCOUNT = '/api/account/create';
export const URI_UPDATE_ACCOUNT = '/api/account/update';


export interface AccountInterface {
  _id: any;
  email: string;
  pwd: string;
  newpwd: string;
  salt: string;
}

export class Account implements AccountInterface {
  static readonly PARAM_EMAIL = 'email';
  static readonly PARAM_PWD = 'pwd';

  _id: any;
  email: string;
  pwd: string;
  newpwd: string;
  salt: string;

  constructor(
    _id: any = null,
    email: string = null,
    pwd: string = null,
    newpwd: string = null,
    salt: string = null
  ) {
    this._id = _id;
    this.email = email;
    this.pwd = pwd;
    this.newpwd = newpwd;
    this.salt = salt;
  }
}
