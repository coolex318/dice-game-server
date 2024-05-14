import { getContext } from "../../server";
import { ResponseCode } from "../../utils";
import { SocketMessage } from "../entities";

/**
 * Encodes a socket message into bytes
 * @param message - The socket message you wanna encode
 */
export const encodeMessage = (message: SocketMessage): Uint8Array => {
  try {
    const { protobuf } = getContext();
    const SocketPayload = protobuf.lookupType("dicepackage.SocketPayload");
    const encoded = SocketPayload.encode(message).finish();
    return encoded;
  } catch (e: any) {
    throw new Error(`Encoding a message failed!, message: ${message}, e: ${e}`);
  }
};

/**
 * Decodes bytes into a socket message
 * @param encoded - The encoded bytes
 */
export const decodeMessage = (encoded: Uint8Array): SocketMessage => {
  try {
    const { protobuf } = getContext();
    const SocketPayload = protobuf.lookupType("dicepackage.SocketPayload");
    const decoded = SocketPayload.decode(encoded).toJSON();
    return {
      code: decoded.code,
      data: decoded.data,
      timestamp: decoded.timestamp,
    };
  } catch (e: any) {
    throw new Error(`Decoding a message failed!, encoded: ${encoded}, e: ${e}`);
  }
};

/**
 * Creates an error socket message
 * @param message - The raw string
 */
export const createErrorMessage = (message: string): Uint8Array => {
  const socketMsg: SocketMessage = {
    code: ResponseCode.ERROR,
    data: message,
    timestamp: Date.now(),
  };

  return encodeMessage(socketMsg);
};

/**
 * Creates a sucess socket message
 * @param message - The raw string
 */
export const createSuccessMessage = (message: string): Uint8Array => {
  const socketMsg: SocketMessage = {
    code: ResponseCode.SUCCESS,
    data: message,
    timestamp: Date.now(),
  };

  return encodeMessage(socketMsg);
};
