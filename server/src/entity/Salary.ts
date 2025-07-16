import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

export enum SalaryStatus {
  PENDING = "pending",
  PAID = "paid"
}

@Entity("salaries")
export class Salary {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, user => user.id)
  employee!: User;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount!: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  netAmount!: number; // after deductions

  @Column({ type: "enum", enum: SalaryStatus, default: SalaryStatus.PENDING })
  status!: SalaryStatus;

  @Column({ type: "date" })
  period!: string; // e.g. "2024-06"

  @Column({ type: "date", nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
} 