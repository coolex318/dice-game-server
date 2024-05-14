import { Type, Static } from "@sinclair/typebox";
import { TAddress, TNumericString } from "../../utils";

export type HandlerCallback = (
  data: any,
  clientInfo: ClientInfo
) => Promise<string>;

export const TSocketMessageSchema = Type.Object({
  code: Type.Number(),
  data: Type.String(),
  timestamp: Type.Number(),
});

export type SocketMessage = Static<typeof TSocketMessageSchema>;

export type ClientInfo = {
  userId: number;
  clientId: string;
};

export const TRegisterMessageSchema = Type.Object({
  address: TAddress,
  signature: Type.String(),
});

export type RegisterMessage = Static<typeof TRegisterMessageSchema>;

export const TCommonResponseSchema = Type.Object({
  environment: Type.String(),
  message: Type.String(),
});

export const TStartSessionMessageSchema = Type.Object({
  currency: Type.String(),
  clientSeed: Type.String(),
});
export type StartSessionMessage = Static<typeof TStartSessionMessageSchema>;

export const TNewBetMessageSchema = Type.Object({
  amount: TNumericString,
  border: Type.Number(),
  diceType: Type.String(),
});
export type NewBetMessage = Static<typeof TNewBetMessageSchema>;
