import protobuf from "protobufjs";
import { loadConfig } from "./config";
import { AppContext } from "./lib/entities";
import { Logger } from "./utils";
import { getDataSource } from "./adapters/database";
import { createWebSocketServer } from "./lib/helpers";

const context: AppContext = {} as any;
export const getContext = () => context;

export const startApp = async () => {
  try {
    context.config = loadConfig();
    context.logger = new Logger({
      level: context.config.logLevel,
      name: "dice",
    });
    context.datasource = await getDataSource();
    context.socketServer = createWebSocketServer(
      context.config,
      context.logger,
      context.datasource
    );
    context.protobuf = await protobuf.load("message.proto");

    console.info("Server ready!");
  } catch (e: unknown) {
    console.error("Error starting app.", e);
    process.exit(1);
  }
};
