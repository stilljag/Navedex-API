import { EntityRepository, Repository } from "typeorm";

import { NaverProject } from "../models/NaverProject";

@EntityRepository(NaverProject)
class NaversProjectsRepository extends Repository<NaverProject> {}

export { NaversProjectsRepository };
