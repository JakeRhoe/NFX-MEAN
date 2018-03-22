import { ExpressServer } from '../express-server/express.server';
import { Server } from 'net';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as Debug from 'debug';
Debug.enable('Web-Server:NFX-CLONE');
const debug = Debug('Web-Server:NFX-CLONE');


export class WebServer {
  public static ENABLE_HTTPS: boolean = true;

  private readonly SSL_PRIVATE_KEY = fs.readFileSync('./dist/server/key/nfxclone.cf.key');
  private readonly SSL_CERTIFICATE = fs.readFileSync('./dist/server/key/nfxclone.cf.cert');

  private expressServer: ExpressServer = null;
  private httpServer: Server = null;
  private httpPort: any = null;
  private httpsServer: Server = null;
  private httpsPort: any = null;

  constructor() {}

  public static startServer() {
    const webServer: WebServer = new WebServer();
    webServer.startServer();
  }

  public static enableHTTPS(enable: boolean = true) {
    WebServer.ENABLE_HTTPS = enable;
  }

  public startServer() {
    debug('Starting server');
    this.expressServer = new ExpressServer();
    this.expressServer.startServer((err) => {
      if (err) { return; }

      this.httpPort = this.normalizePort(process.env.PORT || 80);      
      this.expressServer.getApp().set('port', this.httpPort);

      this.httpServer = http.createServer(this.expressServer.getApp());
      this.httpServer.listen(this.httpPort);
      this.httpServer.on('error',
        (error: NodeJS.ErrnoException) => { this.onError(error, this.httpPort); }
      );
      this.httpServer.on(
        'listening', 
        () => { this.onListening(this.httpServer.address(), this.httpPort); }
      );

      if (WebServer.ENABLE_HTTPS) {
        this.httpsPort = 443;
        const credentials = { key: this.SSL_PRIVATE_KEY, cert: this.SSL_CERTIFICATE };
        this.httpsServer = https.createServer(credentials, this.expressServer.getApp());
        this.httpsServer.listen(this.httpsPort);
        this.httpsServer.on('error',
          (error: NodeJS.ErrnoException) => { this.onError(error, this.httpsPort); }
        );
        this.httpsServer.on(
          'listening',
          () => { this.onListening(this.httpsServer.address(), this.httpsPort); }
        );
      }
    });
  }

  private normalizePort(port: any) {
    const portNumber = parseInt(port, 10);

    if (isNaN(portNumber)) {
      return port;
    }

    if (portNumber >= 0) {
      return portNumber;
    }

    return null;
  }

  private onListening(addr: any, httpPort: any) {
    const bind = (typeof httpPort === 'string')
      ? `Pipe[${addr}]` : `Port[${addr.port}]`;

    debug(`Listening on ${bind}`);
  }

  private onError(error: NodeJS.ErrnoException, httpPort: any) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    const bind = (typeof httpPort === 'string')
      ? `Pipe[${httpPort}]` : `Port[${httpPort}]`;
    
    switch (error.code) {
      case 'EACCES': {
        debug(`${bind}: Permission denied`);
        process.exit(1);
      }
      break;

      case 'EADDRINUSE': {
        debug(`${bind}: Address already in use`);
        process.exit(1);
      }
      break;

      default:
        throw error;
    }    
  }
}
