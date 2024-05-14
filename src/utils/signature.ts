import { Signer, Wallet } from "ethers";
import { verifyMessage } from "ethers/lib/utils";

export const sign = async (
  msg: string,
  signer: Wallet | Signer
): Promise<string> => {
  return signer.signMessage(msg);
};

export const recoverHelloMsgPayload = (helloMsg: string, signature: string) => {
  return verifyMessage(helloMsg, signature);
};
