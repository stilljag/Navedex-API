import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";

import { ProjectsRepository } from "../repositories/ProjectsRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class ProjectController {
  async store(request: Request, response: Response) {
    const { name } = request.body;
    const id = request.params.id;

    //validações
    const schema = yup.object().shape({
      name: yup.string().required("Nome é obrigatório"),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      throw new AppError(error.errors);
    }

    //verifica se o usuario existe
    const usersRepository = getCustomRepository(UsersRepository);

    const userExists = await usersRepository.findOne({
      id: String(id),
    });

    if (!userExists) {
      throw new AppError("User not found!!");
    }

    //verificar se o token é do usuario
    if (process.env.DECODED != id) {
      throw new AppError("Token does not belong to the user!!", 401);
    }

    //criar o project
    const projectRepository = getCustomRepository(ProjectsRepository);

    const project = projectRepository.create({
      name,
    });

    await projectRepository.save(project);

    return response.status(201).json({ project });
  }

  async index(request: Request, response: Response) {
    let { name, admission_date, job_role } = request.query;

    // const queries = {
    //   name: String(name).toUpperCase(),
    //   admission_date: String(admission_date).toUpperCase(),
    //   job_role: String(job_role).toUpperCase(),
    // };

    const id = request.params.id;

    //verifica se o usuario existe
    const usersRepository = getCustomRepository(UsersRepository);

    const userExists = await usersRepository.findOne({
      id: String(id),
    });

    if (!userExists) {
      throw new AppError("User not found!!");
    }

    //verificar se o token é do usuario
    if (process.env.DECODED != id) {
      throw new AppError("Token does not belong to the user!!", 401);
    }

    //verificar se existe navers cadastrados pelo usuario
    const naversRepository = getCustomRepository(NaversRepository);

    let navers = await naversRepository.find({
      where: request.query, //queries,
    });

    //filtra query pelo id do usuário
    const filterNavers = navers.filter((i) => i.user_id == id);

    if (!navers || navers.length == 0 || filterNavers.length == 0) {
      throw new AppError("Navers not found!!");
    }

    return response.json({ Navers: filterNavers });
  }
}

export { ProjectController };
