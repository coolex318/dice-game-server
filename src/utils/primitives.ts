import { Type } from "@sinclair/typebox";

export const TAddress = Type.RegEx(/^0x[a-fA-F0-9]{40}$/);
export const TUrl = Type.String({ format: "uri" });
export const TNumericString = Type.RegEx(/^([0-9])*$/);

export const shorter = (str: string) =>
  str?.length > 8 ? str.slice(0, 6) + "..." + str.slice(-4) : str;
