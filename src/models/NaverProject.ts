import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => Naver)
  @JoinColumn({ name: "naver_id" })
  naver: Naver;

  @Column()
  project_id: string;

  @ManyToOne(() => Project)
  @JoinColumn({ name: "project_id" })
  project: Project;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { NaverProject };