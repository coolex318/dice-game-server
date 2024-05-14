import { BigNumber } from "ethers";
import { decrypt } from "../../utils";
import { DiceParams } from "../entities";
import { createGameResult } from "./hash";

// Multiplier = (1 / Win Chance)*(1 - House Edge)
// roll under Win Chance =  X/100
// roll over  Win Chance = (100-(X+1))/100

// TODO: MOVE TO ENV
const houseEdge = 0.01;

const rollOverStrategy = (border: number, gameResult: BigNumber): boolean =>
  gameResult.gt(border);
const rollUnderStrategy = (border: number, gameResult: BigNumber): boolean =>
  gameResult.lt(border);

const rollOverChance = (border: number): number => (100 - border) / 100;
const rollUnderChance = (border: number): number => border / 100;

export const getRollOverCoefficient = (border: number): number =>
  (1 / rollOverChance(border)) * (1 - houseEdge);
export const getRollUnderCoefficient = (border: number): number =>
  (1 / rollUnderChance(border)) * (1 - houseEdge);

export const diceStrategy = (
  { border, diceType }: DiceParams,
  gameResult: BigNumber
): [boolean, number] => {
  if (diceType === "rollOver")
    return [
      rollOverStrategy(border, gameResult),
      getRollOverCoefficient(border),
    ];

  return [
    rollUnderStrategy(border, gameResult),
    getRollUnderCoefficient(border),
  ];
};

export const getGameResultByNonce = async (
  serverSeed: string,
  clientSeed: string,
  active: boolean,
  nonce: number,
  masterKey: string
): Promise<{
  serverSeed: Buffer;
  clientSeed: string;
  genericHash: Buffer;
  resultHash: Buffer;
  gameResult: BigNumber;
}> => {
  const serverSeedBuffer = active
    ? Buffer.from(decrypt(serverSeed, masterKey), "hex")
    : Buffer.from(serverSeed, "hex");

  const gameResult = createGameResult(serverSeedBuffer, clientSeed, nonce);

  return {
    ...gameResult,
    serverSeed: serverSeedBuffer,
    clientSeed,
  };
};
