import objectId from "objectid";

export class WebSocketClient {
  private ws: any;
  private options: any;
  private log: any;
  private url: any;
  private headers: any;
  public ipAddress: any;
  public clientId: string;
  public userId: number;
  private isAlive: boolean;
  private heartbeatInterval: any;

  constructor(params) {
    const { client, request, options, logger, clientId, userId } = params;
    this.ws = client;
    this.options = options;
    this.log = logger;
    this.url = request.url;
    this.headers = request.headers;
    this.ipAddress =
      request.headers["x-original-forwarded-for"] ||
      request.connection.remoteAddress;
    this.clientId = clientId || objectId().toString();
    this.ws.clientId = this.clientId;
    this.userId = userId;
    this.isAlive = true;
    this.heartbeatInterval = null;

    this.ws.on("pong", this.heartbeat.bind(this));
    this.ws.on("close", this.onClose.bind(this));

    this.keepAlive();
  }

  on(event, callback) {
    this.ws.on(event, callback);
  }

  keepAlive() {
    const interval = this.options.keepAlive;
    if (interval) {
      this.heartbeatInterval = setInterval(this.ping.bind(this), interval);
    }
  }

  ping() {
    if (this.isAlive === false) {
      return this.ws.terminate();
    }
    this.isAlive = false;
    this.ws.ping(() => {});

    return false;
  }

  heartbeat() {
    this.isAlive = true;
  }

  onClose() {
    this.isAlive = false;
    const { ipAddress, clientId } = this;
    this.log.info(`[${clientId} - ${ipAddress}] Connection is closed`);
    clearInterval(this.heartbeatInterval);
  }

  removeAllListeners() {
    this.ws.removeAllListeners();
  }

  send(msg: Uint8Array) {
    this.log.debug(`sending a message to ${this.clientId}:`, msg);
    this.ws.send(msg);
  }

  setLogger(logger) {
    this.log = logger;
  }
}
