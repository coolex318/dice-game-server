import { ResponseCode } from "../../utils";
import { TCommonResponseSchema } from "../entities";

export const RESPONSE_SCHEMA: Record<number, { name: string; schema: any }> = {
  [ResponseCode.SUCCESS]: {
    name: "success",
    schema: TCommonResponseSchema,
  },
  [ResponseCode.INFO]: {
    name: "info",
    schema: TCommonResponseSchema,
  },
  [ResponseCode.WARN]: {
    name: "warn",
    schema: TCommonResponseSchema,
  },
  [ResponseCode.ERROR]: {
    name: "error",
    schema: TCommonResponseSchema,
  },
};
