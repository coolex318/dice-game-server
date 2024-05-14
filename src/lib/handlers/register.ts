import JWT from "jsonwebtoken";
import { WELCOME_MESSAGE } from "../../config";
import { getContext } from "../../server";
import { recoverHelloMsgPayload } from "../../utils";
import { generateToken } from "../../utils/jwt";
import { RegisterMessage } from "../entities";
import { getDataSourceHelpers } from "../helpers";

export const handleRegister = async (data: any): Promise<string> => {
  const message = data as RegisterMessage;
  const { logger, config } = getContext();
  const { createUser } = getDataSourceHelpers();
  logger.info("Registering a new account", { message });
  const { address, signature } = message;

  console.log({ address, signature });
  // validate if the signer address is same to `address`
  const recovered = recoverHelloMsgPayload(WELCOME_MESSAGE, signature);
  if (address.toLowerCase() != recovered.toLowerCase()) {
    throw new Error(`Invalid signature`);
  }

  const id = await createUser(message);
  logger.info("New user registered", { id, message });

  const token = generateToken(id, config.jwt.secretKey);
  return token;
};
