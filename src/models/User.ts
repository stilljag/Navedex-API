import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { Naver } from "./Naver";
import { Project } from "./Project";

@Entity("users")
class User {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Naver, (naver) => naver.userId)
  navers: Naver[];

  @OneToMany(() => Project, (project) => project.userId)
  projects: Project[];

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { User };
