import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";

import { v4 as uuid } from "uuid";
import { User } from "./User";
import { NaverProject } from "./NaverProject";

@Entity("navers")
class Naver {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  name: string;

  @Column()
  birthdate: string;

  @Column()
  admission_date: string;

  @Column()
  job_role: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.navers)
  @JoinColumn({ name: "user_id" })
  userId: User;

  @OneToMany(() => NaverProject, (naverProject) => naverProject.naverProjectId)
  naversProjects: NaverProject[];

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Naver };
