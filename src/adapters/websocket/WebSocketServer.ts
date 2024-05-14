/* eslint-disable no-param-reassign,no-underscore-dangle */
import { EventEmitter } from "events";
import WebSocket from "ws";
import objectId from "objectid";
import { WebSocketClient } from "./WebSocketClient";
import { Logger } from "../../utils";
import http from "http";
import {
  createErrorMessage,
  createSuccessMessage,
  decodeMessage,
} from "../../lib/helpers";
import { handleSockMessage } from "../../lib/handlers";
import { verifyToken } from "../../utils/jwt";
export class WebSocketServer extends EventEmitter {
  private logger: Logger;
  private jwtSecretKey: string;
  private port: number;
  private wsOptions: { keepAlive: number; server: http.Server };
  private halt: boolean;
  private paused: boolean;
  private clientIds: any[];
  private app: any;

  /**
   * @param {Object} options
   */
  constructor(options: {
    port: number;
    wsOptions: { keepAlive: number; server: http.Server };
    logger: Logger;
    jwtSecretKey: string;
  }) {
    super();
    const { port, wsOptions, logger, jwtSecretKey } = options;
    this.logger = logger;
    this.port = port;
    this.wsOptions = wsOptions || {};
    this.halt = false;
    this.paused = false;
    this.clientIds = [];
    this.jwtSecretKey = jwtSecretKey;

    this.app = new WebSocket.Server(this.wsOptions);
    this.app.on("connection", this.onNewConnection.bind(this));

    this.app.on("error", (err) => this.logger.error(`Error`, { error: err }));
    this.app.on("listening", () =>
      this.logger.info(`webSocket: listening`, { port: this.port })
    );
    this.app.on("close", () => {
      this.logger.info(`Closing websocket`, { side: "server", event: "close" });
      this.emit("closeServer"); // TODO: notify that server is down
    });

    this.on("shutdown", this.shutdown);
    this.on("pause", this.pause);
    this.on("resume", this.resume);

    this.listen();
    return this;
  }

  async onClientMessage(msg: Uint8Array, wsClient: WebSocketClient) {
    try {
      const decoded = decodeMessage(msg);
      this.logger.debug(
        `Received a message from client: ${wsClient.clientId}, userId: ${wsClient.userId}`,
        { message: decoded }
      );
      this.emit("mesage", decoded, wsClient);

      const resp = await handleSockMessage(decoded, {
        clientId: wsClient.clientId,
        userId: wsClient.userId,
      });
      return wsClient.send(createSuccessMessage(resp));
    } catch (e: any) {
      this.logger.info("onClientMessage failed.", { e });
      return wsClient.send(createErrorMessage(e.message));
    }
  }

  onClientClose(code, reason, wsClient) {
    const { clientId } = wsClient;
    this.clientIds = this.clientIds.filter((id) => id !== clientId);
    this.emit("close", clientId, code, reason); // TODO: get on close here
    this.on(clientId, () => {});
    wsClient.removeAllListeners();
  }

  notifyAll(message) {
    this.app.clients.forEach((client) => {
      const { clientId } = client;
      try {
        client.send(JSON.stringify({ ...message, data: { clientId } }));
      } catch (e: any) {
        this.logger.error(
          `Unable to notify client "${clientId}": `,
          e.toString()
        );
      }
    });
  }

  closeAll() {
    this.app.clients.forEach((client) => client.close());
  }

  shutdown() {
    this.halt = true;
    this.notifyAll({ event: "reconnect" });
  }

  pause(delay: number) {
    this.paused = true;
    this.notifyAll({ event: "disconnect" });

    setTimeout(this.closeAll.bind(this), delay || 20000);
  }

  resume() {
    this.paused = false;
  }

  registerClient(clientId: string) {
    this.clientIds.push(clientId);
  }

  getClientId(client: WebSocket, url: string) {
    const urlParams = new URLSearchParams(url.replace(/^\//, ""));
    const clientId = urlParams.get("clientId") || objectId().toString();

    if (this.clientIds.includes(clientId)) {
      client.send(JSON.stringify({ error: "clientId is already registered" }));
      client.close();
      return null;
    }

    this.registerClient(clientId);
    return clientId;
  }

  serviceEnabled(client: WebSocket) {
    if (this.halt) {
      client.terminate();
      return null;
    }

    if (this.paused) {
      client.send(
        JSON.stringify({ error: "The service is under maintenance." })
      );
      client.close();
      return null;
    }

    return true;
  }

  createSubscription(wsClient: WebSocketClient) {
    wsClient.on("message", (msg: any) => this.onClientMessage(msg, wsClient));
    wsClient.on("close", (code: number, reason: any) =>
      this.onClientClose(code, reason, wsClient)
    );

    this.on(wsClient.clientId, wsClient.send.bind(wsClient));
  }

  onNewConnection(client: WebSocket, request: http.IncomingMessage) {
    if (this.serviceEnabled(client) !== true) return;

    const options = {
      client,
      request,
      logger: this.logger,
      options: this.wsOptions,
    };

    const { url } = request;
    const token = request.headers["token"];
    if (!token) {
      this.logger.debug("No token provided");
      client.close();
      return;
    }
    const userId = verifyToken(token as string, this.jwtSecretKey);
    if (userId == -1) return;

    const clientId = this.getClientId(client, url!);
    if (clientId === null) return;

    const wsClient = new WebSocketClient({ ...options, url, clientId, userId });
    const { ipAddress } = wsClient;

    this.logger.info("New connection is opened", {
      clientId,
      ipAddress,
      url,
      userId,
    });

    this.createSubscription(wsClient);
  }

  listen() {
    if (this.wsOptions.server) {
      this.wsOptions.server.listen(this.port);
    } else {
      this.logger.warn(
        "WARNING! The 'noServer' options is defined but no server " +
          "instance has been passed to the constructor. You MUST start " +
          "server manually."
      );
    }
  }
}
