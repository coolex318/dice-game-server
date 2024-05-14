import { getContext } from "../../server";
import { DataSource } from "typeorm";
import {
  UserEntity,
  GameBetEntity,
  GameSessionEntity,
  CurrencyEntity,
} from "./entities";

export const getDataSource = async (): Promise<DataSource> => {
  const { config } = getContext();

  try {
    const appDataSource = new DataSource({
      type: "postgres",
      host: config.datasource.host,
      port: config.datasource.port,
      username: config.datasource.username,
      password: config.datasource.password,
      database: config.datasource.database,
      synchronize: true,
      entities: [UserEntity, GameBetEntity, GameSessionEntity, CurrencyEntity],
      subscribers: [],
      migrations: [],
    });
    await appDataSource.initialize();
    return appDataSource;
  } catch (e: any) {
    throw new Error(`Database initalization failed, error: ${e.message}`);
  }
};
