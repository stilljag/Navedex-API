import { EntityRepository, Repository } from "typeorm";

import { Naver } from "../models/Naver";

@EntityRepository(Naver)
class NaversRepository extends Repository<Naver> {}

export { NaversRepository };
