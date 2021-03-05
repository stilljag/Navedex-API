import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { NaversRepository } from "../repositories/NaversRepository";
import { NaversProjectsRepository } from "../repositories/NaversProjectsRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";
import { ProjectsRepository } from "../repositories/ProjectsRepository";

class NaverController {
  async store(request: Request, response: Response) {
    const {
      name,
      birthdate,
      admission_date,
      job_role,
      projects,
    } = request.body;
    const id = request.params.id;

    //validações
    const schema = yup.object().shape({
      name: yup.string().required("Nome é obrigatório"),
      birthdate: yup.string().required("Data de nascimento é obrigatório"),
      admission_date: yup.string().required("Data de admissão é obrigatório"),
      job_role: yup.string().required("Função é obrigatório"),
      //projects: yup.string().required("Projeto é obrigatório"),
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

    //verifica se os projetos existem
    const projectsRepository = getCustomRepository(ProjectsRepository);

    const projectsExists = await projectsRepository.findByIds(projects);

    if (projectsExists.length != projects.length) {
      throw new AppError("Project not found!!");
    }

    //criar o naver
    const naversRepository = getCustomRepository(NaversRepository);
    const naver = naversRepository.create({
      name,
      birthdate,
      admission_date,
      job_role,
      user_id: userExists.id,
    });

    await naversRepository.save(naver);

    //cria o projeto
    const naversProjectRepository = getCustomRepository(
      NaversProjectsRepository
    );

    const saveProject = naversProjectRepository.create({
      naver_id: naver.id,
      project_id: projects,
    });

    await naversProjectRepository.save(saveProject);

    return response.status(201).json({ naver, saveProject });
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

export { NaverController };
