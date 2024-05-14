import { BigNumber } from "ethers";
import {
  GameBetEntity,
  GameSessionEntity,
} from "../../adapters/database/entities";
import { UserEntity } from "../../adapters/database/entities/UserEntity";
import { DEFAULT_INIT_BALANCE } from "../../config";
import { getContext } from "../../server";
import { shorter } from "../../utils";
import { RegisterMessage } from "../entities";

/**
 * Create a new user with the register message
 * @param message The register message
 * @returns - The user id
 */
export const createUser = async (message: RegisterMessage): Promise<number> => {
  const { datasource } = getContext();

  const { address, signature } = message;
  const userRepository = datasource.getRepository(UserEntity);
  let userEntity = await userRepository.findOneBy({ address });
  if (userEntity) {
    return userEntity.id;
  }

  userEntity = new UserEntity();
  userEntity.address = address;
  userEntity.name = shorter(address);
  userEntity.balance = DEFAULT_INIT_BALANCE;
  userEntity.signed = signature;
  userEntity.created_at = new Date();
  userEntity.updated_at = new Date();

  await datasource.manager.save(userEntity);

  return userEntity.id;
};

/**
 * Finds a user by userId
 * @param userId The user id you want to find
 */
export const findUserById = async (
  userId: number
): Promise<UserEntity | null> => {
  const { datasource } = getContext();
  const userRepository = datasource.getRepository(UserEntity);
  const userEntity = await userRepository.findOneBy({ id: userId });
  return userEntity;
};

// ========================= GameSessionEntity ========================= //
/**
 * Get a game session record by client id. if no exists, it creates a new one and returns it
 * @param clientId - The client id you wanna get the session for
 */
export const getGameSessionByClientId = async (
  clientId: string
): Promise<GameSessionEntity | null> => {
  const { datasource } = getContext();
  const gameSessionRepository = datasource.getRepository(GameSessionEntity);
  const gameSessionEntity = await gameSessionRepository.findOneBy({
    clientId,
  });

  return gameSessionEntity;
};

/**
 * Finds the active session for a given clientId
 * @param clientId - The client id you're gonna find for
 */
export const findSessionActiveByClient = async (
  clientId: string
): Promise<GameSessionEntity | null> => {
  const { datasource } = getContext();
  try {
    const gameSessionRepository = datasource.getRepository(GameSessionEntity);
    const res = await gameSessionRepository
      .createQueryBuilder("s")
      .andWhere("s.clientId = :clientId", { clientId })
      .andWhere("s.active = :active", { active: true })
      .getOne();
    return res;
  } catch (error: any) {
    throw new Error(
      `Finding active session by client failed. msg: ${error?.message}`
    );
  }
};

// ========================= GameBetEntity ========================= //

/**
 * Finds the bet entity for the last session
 * @param sessionId - The session id you wanna find the bet for
 */
export const findBetByLastSession = async (
  sessionId: number
): Promise<GameBetEntity | null> => {
  const { datasource } = getContext();

  try {
    const gameBetRepository = datasource.getRepository(GameBetEntity);
    const res = await gameBetRepository
      .createQueryBuilder("b")
      .andWhere("b.gameSessionId = :gameSessionId", {
        gameSessionId: sessionId,
      })
      .orderBy("b.id", "DESC")
      .limit(1)
      .getOne();

    return res;
  } catch (error: any) {
    throw new Error(
      `Finding the bet by the last session failed. msg: ${error?.message}`
    );
  }
};

/**
 * Finds last bets by count and userId, count defaults to 10
 * @param count - The number of bets
 * @param userId - The user id you're gonna search for
 */
export const findLastBets = async (
  count = 10,
  userId?: string
): Promise<GameBetEntity[] | null> => {
  const { datasource } = getContext();

  try {
    const gameBetRepository = datasource.getRepository(GameBetEntity);
    let query = gameBetRepository
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.rounds", "rounds")
      .leftJoinAndSelect("b.gameSession", "gameSession");

    if (userId) {
      query = query.andWhere("gameSession.userId = :userId", { userId });
    }

    const bets = await query
      .limit(count)
      .orderBy("b.createdAt", "DESC")
      .getMany();

    return bets;
  } catch (error: any) {
    throw new Error(
      `Finding the last bets by count and userId failed. msg: ${error?.message}`
    );
  }
};

/**
 * Finds a bet by id
 * @param betId - The bet id
 * @returns - The gameBet entity
 */
export const findBetByIdWithSession = async (
  betId: number
): Promise<GameBetEntity | null> => {
  const { datasource } = getContext();

  try {
    const gameBetRepository = datasource.getRepository(GameBetEntity);
    return await gameBetRepository
      .createQueryBuilder("b")
      .leftJoinAndSelect("b.gameSession", "gameSession")
      .where("b.id = :betId", { betId })
      .getOne();
  } catch (error: any) {
    throw new Error(`Finding the bet by betId failed. msg: ${error?.message}`);
  }
};
