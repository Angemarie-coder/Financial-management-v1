// src/entity/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Budget } from "./Budget";

export enum UserRole {
  ADMIN = "admin",
  PROGRAM_MANAGER = "program_manager",
  FINANCE_MANAGER = "finance_manager",
  VIEWER = "viewer", 
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

 @Column({ default: 'Unknown' })
name!: string;


 @Column({ default: 'Unknown' })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.FINANCE_MANAGER,
  })
  role!: UserRole;

  @Column({ type: "varchar", nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires?: Date;

     @Column({ type: "varchar", nullable: true }) // <-- NEW: Add this column
    profilePictureUrl!: string;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  emailVerificationToken?: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerificationExpires?: Date;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @Column({ type: "timestamp", nullable: true })
  passwordExpiresAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  
  @OneToMany(() => Budget, (budget) => budget.createdBy)

  budgets!: Budget[];
}
