import * as minimist from 'minimist';
import { WebServer } from './web-server/web.server';

import * as Debug from 'debug';
Debug.enable('NfxServer:NFX-CLONE');
const debug = Debug('NfxServer:NFX-CLONE');


class NfxServer {
  constructor() {}

  public static startServer() {
    const nfxServer: NfxServer = new NfxServer();
    nfxServer.startServer();
  }

  public startServer() {
    debug('Starting server');

    const argv = minimist(process.argv.slice(2));
    
    WebServer.enableHTTPS(argv['https'] ? true : false);
    WebServer.startServer();
  }
}

NfxServer.startServer();