import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

@Unique(["id"])
@Entity({
  name: "game_sessions",
})
export class GameSessionEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Index()
  @Column({
    type: "boolean",
  })
  public active!: boolean;

  @Index()
  @Column({
    type: "integer",
  })
  public userId!: number;

  @Index()
  @Column({
    type: "varchar",
    length: 255,
  })
  public clientId!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  public serverSeed!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  public clientSeed!: string;

  @Column({
    type: "integer",
  })
  public betsCount = 0;

  @CreateDateColumn({
    type: "timestamp",
  })
  public createdAt!: Date;
}
