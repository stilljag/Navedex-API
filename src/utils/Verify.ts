import "dotenv/config";
import { getCustomRepository } from "typeorm";

import { UsersRepository } from "../repositories/UsersRepository";
import { ProjectsRepository } from "../repositories/ProjectsRepository";
import { NaversRepository } from "../repositories/NaversRepository";

import { AppError } from "../errors/AppError";

class Verify {
  usersRepository = getCustomRepository(UsersRepository);
  projectsRepository = getCustomRepository(ProjectsRepository);
  naversRepository = getCustomRepository(NaversRepository);

  async userExistsLogin(email: string) {
    console.log(email);
    const user = await this.usersRepository.findOne({ email });
    if (!user) throw new AppError("User not found!!");

    return user;
  }

  async userExists(id: string) {
    const user = await this.usersRepository.findOne({ id });

    if (!user) throw new AppError("User not found!!");

    //verificar se o token é do usuario
    if (process.env.DECODED != id)
      throw new AppError("Token does not belong to the user!!", 401);

    return user;
  }

  async registerOfUser(orign: string, query: object, id: string) {
    let source = [];
    if (orign == "Project") {
      source = await this.projectsRepository.find({ where: query });
    } else {
      source = await this.naversRepository.find({ where: query });
    }

    //filtra query pelo id do usuário
    const filterSource = source.filter((i) => i.user_id == id);

    if (!source || source.length == 0 || filterSource.length == 0)
      throw new AppError(`${orign} not found!!`);

    return filterSource;
  }

  async projectExists(id: string, project_id: string) {
    const project = await this.projectsRepository.findOne({
      id: String(project_id),
    });

    if (!project) throw new AppError("Project not found!!");

    if (project.user_id != id)
      throw new AppError("Project does not belong to the user!!");

    return project;
  }

  async naverExists(id: string, naver_id: string) {
    const naver = await this.naversRepository.findOne({
      id: String(naver_id),
    });

    if (!naver) throw new AppError("Naver not found!!");

    if (naver.user_id != id)
      throw new AppError("Naver does not belong to the user!!");

    return naver;
  }
}

export { Verify };
