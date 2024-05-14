import * as fs from "fs";
import { config as dotenv } from "dotenv";
import { Config, ConfigSchema } from "./lib/entities/config";
import { ajv } from "./utils";
import { ethers } from "ethers";

dotenv();

export const WELCOME_MESSAGE = "I want to become a dice gamer";
export const DEFAULT_MAX_REQUESTS = 200;
export const DEFAULT_TIME_WINDOW = 1000 * 60; // 1 min
export const DEFAULT_SERVICE_PORT = 5050;
export const DEFAULT_KEEP_ALIVE = 40000;
export const DEFAULT_ENV = "staging";
export const DEFAULT_INIT_BALANCE = ethers.utils.parseEther("1000").toString();

// TOOD: Hardcoded values need to be configured in game setting
export const HARDCODED_VALUES = {
  MIN_BET: ethers.utils.parseEther("1"),
  MAX_BET: ethers.utils.parseEther("10000"),
  MAX_PROFIT: ethers.utils.parseEther("10000"),
};

export const loadConfig = (): Config => {
  let configFile: any = {};
  try {
    let json: string;
    const path = process.env.CONFIG_FILE ?? "config.json";
    if (fs.existsSync(path)) {
      json = fs.readFileSync(path, { encoding: "utf-8" });
      configFile = JSON.parse(json);
    }
  } catch (e: unknown) {
    console.error("Error reading config file");
    console.error(e);
    process.exit(1);
  }

  const appConfig = {
    environment: process.env.ENVIRONMENT || configFile.env || DEFAULT_ENV,
    logLevel: process.env.LOG_LEVEL || configFile.logLevel || "info",
    crypto: {
      masterKey: process.env.MASTER_KEY || configFile.crypto.masterKey,
    },
    jwt: {
      secretKey: process.env.JWT_SECRET_KEY || configFile.jwt.secretKey,
    },
    server: {
      port:
        Number(process.env.SERVER_PORT) ||
        configFile.server.port ||
        DEFAULT_SERVICE_PORT,
      maxRequests:
        Number(process.env.MAX_REQUESTS) ||
        configFile.server.maxRequests ||
        DEFAULT_MAX_REQUESTS,
      requestTimeWindow:
        Number(process.env.REQUEST_TIME_WINDOW) ||
        configFile.server.requestTimeWindow ||
        DEFAULT_TIME_WINDOW,
      keepAlive:
        Number(process.env.KEEP_ALIVE) ||
        configFile.server.keepAlive ||
        DEFAULT_KEEP_ALIVE,
    },
    datasource: {
      host:
        process.env.POSTGRES_HOST || configFile.datasource?.host || "127.0.0.1",
      port: process.env.POSTGRES_PORT || configFile.datasource?.port || 5432,
      username:
        process.env.POSTGRES_USERNAME ||
        configFile.datasource?.username ||
        "postgres",
      password:
        process.env.POSTGRES_PASSWORD ||
        configFile.datasource?.password ||
        "postgres",
      database:
        process.env.POSTGRES_PASSWORD ||
        configFile.datasource?.database ||
        "dice",
    },
  };

  if (!appConfig.crypto.masterKey) {
    throw new Error(
      `MasterKey should be configured in .env file or config file`
    );
  }

  const validate = ajv.compile(ConfigSchema);
  const valid = validate(appConfig);

  if (!valid) {
    throw new Error(
      validate.errors
        ?.map((err: unknown) => JSON.stringify(err, null, 2))
        .join(",")
    );
  }
  return appConfig as Config;
};
