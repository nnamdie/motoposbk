import { Entity, ManyToOne } from "@mikro-orm/core";
import { BaseEntity } from "@/common/entities/base.entity";
import { Business } from "./business.entity";
import { User } from "@/auth/entities/user.entity";

@Entity({ abstract: true })
export abstract class TenantEntity extends BaseEntity {
  @ManyToOne(() => Business)
  business!: Business;

  @ManyToOne(() => User, { nullable: true })
  createdBy?: User;

  @ManyToOne(() => User, { nullable: true })
  updatedBy?: User;
}
