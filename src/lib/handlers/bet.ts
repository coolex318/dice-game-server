import { BigNumber } from "ethers";
import {
  BillingStatusEnum,
  DiceChoiceSide,
  GameBetEntity,
} from "../../adapters/database/entities";

import { HARDCODED_VALUES } from "../../config";
import { getContext } from "../../server";
import { ClientInfo, DiceBorderType, NewBetMessage } from "../entities";
import { getDataSourceHelpers, getFullDisplayBalance } from "../helpers";
import { diceStrategy, getGameResultByNonce } from "../helpers/game";

export const handleBet = async (
  data: any,
  clientInfo: ClientInfo
): Promise<string> => {
  const { logger, config, datasource } = getContext();
  logger.info("Handling a bet", { data, clientInfo });
  const { findSessionActiveByClient, findBetByLastSession, findUserById } =
    getDataSourceHelpers();
  const message = data as NewBetMessage;
  const { amount, border, diceType } = message;

  const { userId, clientId } = clientInfo;

  const gameSession = await findSessionActiveByClient(clientId);
  if (!gameSession) {
    throw new Error(
      `Invalid gameSession for user: ${userId}, clientId: ${clientId}`
    );
  }

  const lastBet = await findBetByLastSession(gameSession.id);
  const userEntity = await findUserById(userId);
  if (!userEntity) {
    throw new Error(`Can't find a user for userId: ${userId}`);
  }

  if (lastBet && lastBet.billingStatus === BillingStatusEnum.WAIT) {
    throw new Error(`The bet is getting processed`);
  }

  if (BigNumber.from(userEntity.balance).lt(amount)) {
    throw new Error(
      `Not enough balance for bet, balance: ${userEntity.balance}, amount: ${amount}`
    );
  }

  const nonce = gameSession.betsCount;
  if (BigNumber.from(amount).lt(HARDCODED_VALUES.MIN_BET)) {
    throw new Error(
      `Bet amount is less than the min value. minBet: ${HARDCODED_VALUES.MIN_BET.toString()}, amount: ${amount}`
    );
  }

  if (BigNumber.from(amount).gt(HARDCODED_VALUES.MAX_BET)) {
    throw new Error(
      `Bet amount is greater than the max value. maxBet: ${HARDCODED_VALUES.MAX_BET.toString()}, amount: ${amount}`
    );
  }

  const gameState = await getGameResultByNonce(
    gameSession.serverSeed,
    gameSession.clientSeed,
    gameSession.active,
    nonce,
    config.crypto.masterKey
  );

  console.log({ gameState });

  const [isWin, coef] = diceStrategy(
    { border, diceType: diceType as DiceBorderType },
    gameState.gameResult
  );

  console.log({ isWin, coef });

  const amountInNum = getFullDisplayBalance(amount, 18, 2);
  let winAmountInNum = getFullDisplayBalance(amount, 18, 2) * coef;
  const maxProfitInNum = getFullDisplayBalance(
    HARDCODED_VALUES.MAX_PROFIT,
    18,
    2
  );
  if (winAmountInNum - amountInNum > maxProfitInNum) {
    winAmountInNum = amountInNum + maxProfitInNum;
  }

  let winAmountInBigNum = BigNumber.from(Math.floor(winAmountInNum * 1000)).mul(
    BigNumber.from(10).pow(15)
  );

  const gameBetEntity = new GameBetEntity();
  gameBetEntity.gameSessionId = gameSession.id;
  gameBetEntity.amount = amount;
  gameBetEntity.multiplier = coef.toString();
  gameBetEntity.winAmount = winAmountInBigNum.toString();
  gameBetEntity.isWin = isWin;
  gameBetEntity.requestId = "0x"; // TODO: should read requestId from the request
  gameBetEntity.choice = border.toString();
  gameBetEntity.nonce = nonce;
  gameBetEntity.choiceSide = diceType as DiceChoiceSide;
  gameBetEntity.billingStatus = BillingStatusEnum.PROCESSED;
  await datasource.manager.save(gameBetEntity);

  userEntity.balance = BigNumber.from(userEntity.balance)
    .sub(amount)
    .toString();
  await datasource.manager.save(userEntity);

  gameSession.betsCount = nonce + 1;
  await datasource.manager.save(gameSession);

  return JSON.stringify({
    amount,
    winAmount: winAmountInBigNum.toString(),
    choice: border,
    nonce,
  });
};
