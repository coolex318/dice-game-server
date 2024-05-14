import { Type, Static } from "@sinclair/typebox";

export const TServerConfig = Type.Object({
  port: Type.Integer({ minimum: 1, maximum: 65535 }),
  maxRequests: Type.Number(),
  requestTimeWindow: Type.Number(),
  keepAlive: Type.Number(),
});

export const ConfigSchema = Type.Object({
  environment: Type.String(),
  server: TServerConfig,
  crypto: Type.Object({
    masterKey: Type.String(),
  }),
  jwt: Type.Object({
    secretKey: Type.String(),
  }),
  datasource: Type.Object({
    host: Type.String({ format: "ipv4" }),
    port: Type.Integer({ minimum: 1, maximum: 65535 }),
    username: Type.String(),
    password: Type.String(),
    database: Type.String(),
  }),
  logLevel: Type.Union([
    Type.Literal("fatal"),
    Type.Literal("error"),
    Type.Literal("warn"),
    Type.Literal("info"),
    Type.Literal("debug"),
    Type.Literal("trace"),
    Type.Literal("silent"),
  ]),
});

export type Config = Static<typeof ConfigSchema>;
