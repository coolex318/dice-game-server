import protobuf from "protobufjs";

import { DataSource } from "typeorm";
import { WebSocketServer } from "../../adapters/websocket";
import { Logger } from "../../utils";
import { Config } from "./config";

export type AppContext = {
  logger: Logger;
  config: Config;
  datasource: DataSource;
  socketServer: WebSocketServer;
  protobuf: protobuf.Root;
};
