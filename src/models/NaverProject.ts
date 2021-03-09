import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
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

  @PrimaryColumn()
  naver_id: string;

  @ManyToOne(() => Naver, (naver) => naver.naversProjects)
  @JoinColumn({ name: "naver_id" })
  naverProjectId: Naver;

  @PrimaryColumn()
  project_id: string;

  @ManyToOne(() => Project, (project) => project.naversProjects)
  @JoinColumn({ name: "project_id" })
  projectId: Project;

  @CreateDateColumn()
  created_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuid();
    }
  }
}

export { NaverProject };
