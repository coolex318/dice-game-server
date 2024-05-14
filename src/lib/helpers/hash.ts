import { generateRandomBytes } from "../../utils";
import { createHmac } from "crypto";
import { BigNumber } from "ethers";

export const createServerSeed = () => {
  return generateRandomBytes(32);
};

export const createGenericHash = (
  serverSeed: Buffer,
  clientSeed: string,
  nonce: number
): Buffer => {
  const key = createHmac("sha256", serverSeed.toString("hex"));
  key.write(`${clientSeed}:${nonce}`);
  key.end();

  return key.read() as Buffer;
};

export const getBytesSum = (hash: Buffer): BigNumber => {
  const result = [1, 2, 3, 4].reduce(
    (sum, val) => sum.add(BigNumber.from(hash[val]).div(256 ** val)),
    BigNumber.from(0)
  );

  return result;
};

export const prepareResultHash = (genericHash: Buffer): [Buffer, BigNumber] => {
  const bytesSum = getBytesSum(genericHash).mul(100);
  const key = createHmac("sha256", genericHash);
  key.write(bytesSum.toString());
  key.end();

  return [key.read() as Buffer, bytesSum];
};

interface RoundResult {
  genericHash: Buffer;
  resultHash: Buffer;
  gameResult: BigNumber;
}

export const createGameResult = (
  serverSeed: Buffer,
  clientSeed: string,
  nonce: number
): RoundResult => {
  const genericHash = createGenericHash(serverSeed, clientSeed, nonce);
  const [resultHash, gameResult] = prepareResultHash(genericHash);

  return { genericHash, resultHash, gameResult };
};
