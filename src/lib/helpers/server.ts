import http from "http";
import { getContext } from "../../server";
import { WebSocketServer } from "../../adapters/websocket";
import { Config } from "../entities";
import { Logger } from "../../utils";
import { DataSource } from "typeorm";
import { handleRegister } from "../handlers";

export const createHttpServer = (datasource: DataSource): http.Server => {
  const { logger } = getContext();
  return http.createServer(
    async (req: http.IncomingMessage, res: http.ServerResponse) => {
      const { url } = req;
      if (url === "/shutdown") {
        const ip = req.headers["x-original-forwarded-for"];
        if (ip) {
          logger.info("Unauthorized attempt to shutdown the server");
          res.writeHead(403);
          return res.end("Forbidden");
        }
      }

      if (url === "/health") {
        const dbStatus = datasource.isInitialized;
        const { code, message } = dbStatus
          ? { code: 200, message: "ok" }
          : {
              code: 500,
              message: `Connection error, database status: ${dbStatus}`,
            };

        res.writeHead(code);
        return res.end(message);
      }

      if (url === "/register") {
        const address = req.headers["address"];
        const signature = req.headers["signature"];

        try {
          const token = await handleRegister({ address, signature });
          res.writeHead(200);
          return res.end(JSON.stringify({ token }));
        } catch (e: any) {
          res.writeHead(500);
          return res.end(JSON.stringify({ message: "Registration failed" }));
        }
      }

      res.writeHead(404);
      return res.end("NOT FOUND");
    }
  );
};

export const createWebSocketServer = (
  config: Config,
  logger: Logger,
  datasource: DataSource
): WebSocketServer => {
  const httpServer = createHttpServer(datasource);
  const socketServer = new WebSocketServer({
    port: config.server.port,
    wsOptions: { keepAlive: config.server.keepAlive, server: httpServer },
    logger,
    jwtSecretKey: config.jwt.secretKey,
  });

  return socketServer;
};
