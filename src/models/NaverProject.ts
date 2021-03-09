import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  PrimaryColumn,
} from "typeorm";
import { v4 as uuid } from "uuid";
import { Naver } from "./Naver";
import { Project } from "./Project";

@Entity("navers_projects")
class NaverProject {
  @PrimaryColumn()
  readonly id: string;

  @Column()
  naver_id: string;

  @ManyToMany(() => Naver)
  @JoinTable({ name: "navers" })
  naver: Naver;

  @Column()
  project_id: string;

  @ManyToMany(() => Project)
  @JoinTable({ name: "projects" })
  project: Project[];

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { NaverProject };
