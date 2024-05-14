import { Entity, PrimaryGeneratedColumn, Column, Unique, Index } from "typeorm";

@Unique(["id", "address", "name"])
@Entity({
  name: "users",
})
export class UserEntity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Index()
  @Column({
    type: "varchar",
    length: 100,
  })
  public address!: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  public name!: string;

  @Column({
    type: "varchar",
    length: "1000",
  })
  public signed!: string;

  @Column({
    type: "varchar",
  })
  public balance!: string;

  @Column({
    type: "timestamp",
  })
  public created_at!: Date;

  @Column({
    type: "timestamp",
  })
  public updated_at!: Date;
}
