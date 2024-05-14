import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";

export type DiceChoiceSide = "rollOver" | "rollUnder";

export enum BillingStatusEnum {
  "WAIT",
  "PROCESSED",
  "FAIL",
}

@Unique(["id"])
@Entity({
  name: "game_bets",
})
export class GameBetEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: "varchar",
    length: 36,
  })
  public requestId!: string;

  @Column({
    type: "varchar",
    length: 32,
  })
  public amount!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 32,
  })
  public winAmount!: string;

  @Index()
  @Column({
    type: "boolean",
  })
  public isWin!: boolean;

  @Column({
    type: "varchar",
    length: 20,
  })
  public choiceSide!: DiceChoiceSide;

  @Column({
    type: "varchar",
    length: 20,
  })
  public choice!: string;

  @Column({
    type: "varchar",
    length: 20,
  })
  public multiplier!: string;

  @Column({
    type: "integer",
  })
  public nonce!: number;

  @Index()
  @Column({
    type: "smallint",
    width: 5,
  })
  public billingStatus: BillingStatusEnum = BillingStatusEnum.WAIT;

  @CreateDateColumn({
    type: "timestamp",
  })
  public createdAt!: Date;

  @Column({
    type: "integer",
  })
  public gameSessionId!: number;
}
