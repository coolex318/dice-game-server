import { RequestCode } from "../../utils";
import {
  TStartSessionMessageSchema,
  HandlerCallback,
  TNewBetMessageSchema,
} from "../entities";
import { handleBet } from "../handlers/bet";
import { handleSession } from "../handlers/session";

export const REQUEST_SCHEMAS: Record<
  number,
  { name: string; schema: any; handler: HandlerCallback }
> = {
  [RequestCode.START_SESSION]: {
    name: "StartSession",
    schema: TStartSessionMessageSchema,
    handler: handleSession,
  },
  [RequestCode.NEW_BET]: {
    name: "NewBet",
    schema: TNewBetMessageSchema,
    handler: handleBet,
  },
};
