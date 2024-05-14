import { GameSessionEntity } from "../../adapters/database/entities";
import { getContext } from "../../server";
import { decrypt, encrypt } from "../../utils";
import { ClientInfo, StartSessionMessage } from "../entities";
import {
  createGameResult,
  createServerSeed,
  getDataSourceHelpers,
} from "../helpers";

export const handleSession = async (
  data: any,
  clientInfo: ClientInfo
): Promise<string> => {
  const { logger, config, datasource } = getContext();
  const { getGameSessionByClientId } = getDataSourceHelpers();
  const message = data as StartSessionMessage;
  logger.info("Starting/Resuming a session", { message, clientInfo });
  let gameSessionEntity = await getGameSessionByClientId(clientInfo.clientId);

  if (gameSessionEntity) {
    const decryptedServerSeed = decrypt(
      gameSessionEntity.serverSeed,
      config.crypto.masterKey
    );

    const { resultHash } = createGameResult(
      Buffer.from(decryptedServerSeed, "hex"),
      gameSessionEntity.clientSeed,
      gameSessionEntity.betsCount
    );

    return JSON.stringify({
      sessionId: gameSessionEntity.id,
      resultHash: resultHash.toString("hex"),
    });
  }

  const serverSeed = createServerSeed();
  const encryptedServerSeed = encrypt(
    serverSeed.toString("hex"),
    config.crypto.masterKey
  );

  const { resultHash } = createGameResult(serverSeed, message.clientSeed, 0);

  gameSessionEntity = new GameSessionEntity();
  gameSessionEntity.userId = clientInfo.userId;
  gameSessionEntity.clientId = clientInfo.clientId;
  gameSessionEntity.active = true;
  gameSessionEntity.clientSeed = message.clientSeed;
  gameSessionEntity.serverSeed = encryptedServerSeed;
  gameSessionEntity.createdAt = new Date();

  await datasource.manager.save(gameSessionEntity);

  return JSON.stringify({
    sessionId: gameSessionEntity.id,
    resultHash: resultHash.toString("hex"),
  });
};
