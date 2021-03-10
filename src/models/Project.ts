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

@Entity("projects")
class Project {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  name: string;

  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.projects)
  @JoinColumn({ name: "user_id" })
  userId: User;

  @OneToMany(() => NaverProject, (naverProject) => naverProject.projectId)
  naversProjects: NaverProject[];

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { Project };
