import { Request, Response } from "express";
import {
  createQueryBuilder,
  getConnection,
  getCustomRepository,
} from "typeorm";
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
    // const naversProjectRepository = getCustomRepository(
    //   NaversProjectsRepository
    // );

    // const saveProject = naversProjectRepository.create({
    //   naver_id: naver.id,
    //   project_id: projects,
    // });

    // await naversProjectRepository.save(saveProject); , saveProject

    return response.status(201).json({ naver });
  }

  async update(request: Request, response: Response) {
    const {
      name,
      birthdate,
      admission_date,
      job_role,
      projects,
    } = request.body;

    const { id, naver_id } = request.params;

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

    //verifica se o Naver existe
    const naversRepository = getCustomRepository(NaversRepository);

    const naverExists = await naversRepository.findOne({
      id: String(naver_id),
    });

    if (!naverExists) {
      throw new AppError("Naver not found!!");
    }

    if (naverExists.user_id != id)
      throw new AppError("Naver does not belong to the user!!");

    try {
      const naver = await createQueryBuilder()
        .update("navers")
        .set({
          name,
          birthdate,
          admission_date,
          job_role,
        })
        .where("id = :id", { id: naverExists.id })
        .execute();

      return response
        .status(200)
        .json({ "Message >>": "Naver successfully update!" });
    } catch (error) {
      throw new AppError(error.errors);
    }
  }

  async index(request: Request, response: Response) {
    let { name, admission_date, job_role } = request.query;
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

  async show(request: Request, response: Response) {
    const { id, naver_id } = request.params;

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

    //verifica se o Naver existe
    const naversRepository = getCustomRepository(NaversRepository);

    const naverExists = await naversRepository.findOne({
      id: String(naver_id),
    });

    if (!naverExists) {
      throw new AppError("Naver not found!!");
    }

    if (naverExists.user_id != id)
      throw new AppError("Naver does not belong to the user!!");

    return response.json({ Navers: naverExists });
  }

  async delete(request: Request, response: Response) {
    const { id, naver_id } = request.params;

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

    //verifica se o Naver existe
    const naversRepository = getCustomRepository(NaversRepository);

    const naverExists = await naversRepository.findOne({
      id: String(naver_id),
    });

    if (!naverExists) {
      throw new AppError("Naver not found!!");
    }

    if (naverExists.user_id != id)
      throw new AppError("Naver does not belong to the user!!");

    try {
      await getCustomRepository(NaversRepository)
        .createQueryBuilder()
        .delete()
        .where("id = :id", { id: naverExists.id })
        .execute();
    } catch (error) {
      throw new AppError(error);
    }

    return response
      .status(200)
      .json({ "Message >>": "Naver successfully deleted!" });
  }
}

export { NaverController };
