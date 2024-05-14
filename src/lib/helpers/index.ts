export * from "./balance";
export * from "./server";
export * from "./proto";
export * from "./hash";

import {
  createUser,
  getGameSessionByClientId,
  findSessionActiveByClient,
  findBetByLastSession,
  findLastBets,
  findBetByIdWithSession,
  findUserById,
} from "./datasource";

export const getDataSourceHelpers = () => {
  return {
    createUser,
    findUserById,
    getGameSessionByClientId,
    findSessionActiveByClient,
    findBetByLastSession,
    findLastBets,
    findBetByIdWithSession,
  };
};
