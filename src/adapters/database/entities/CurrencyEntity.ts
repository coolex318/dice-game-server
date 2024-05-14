import { Entity, PrimaryGeneratedColumn, Column, Unique, Index } from "typeorm";

@Unique(["id", "address", "name", "symbol"])
@Entity({
  name: "currencies",
})
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({
    type: "varchar",
    length: 100,
  })
  public name!: string;

  @Index()
  @Column({
    type: "varchar",
    length: 100,
  })
  public address!: string;

  @Column({
    type: "varchar",
    length: "1000",
  })
  public decimal!: number;

  @Column({
    type: "varchar",
    length: "1000",
  })
  public symbol!: string;

  @Column({
    type: "bigint",
  })
  public minBet!: string;

  @Column({
    type: "bigint",
  })
  public maxBet!: string;

  @Column({
    type: "timestamp",
  })
  public created_at!: Date;
}
