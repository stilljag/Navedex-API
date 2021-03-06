import { Request, Response } from "express";
import * as yup from "yup";
import { createQueryBuilder, getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { ProjectsRepository } from "../repositories/ProjectsRepository";
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
      user_id: userExists.id,
    });

    await projectRepository.save(project);

    return response.status(201).json({ project });
  }

  async update(request: Request, response: Response) {
    const { name } = request.body;

    const { id, project_id } = request.params;

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

    //verifica se o projeto existe
    const projectsRepository = getCustomRepository(ProjectsRepository);

    const projectsExists = await projectsRepository.findOne({
      id: String(project_id),
    });

    if (!projectsExists) {
      throw new AppError("Project not found!!");
    }

    //verifica se o projeto pertence ao usuariao
    if (projectsExists.user_id != id)
      throw new AppError("project does not belong to the user!!");

    try {
      const project = await createQueryBuilder()
        .update("projects")
        .set({
          name,
          user_id: userExists.id,
        })
        .where("id = :id", { id: projectsExists.id })
        .execute();

      return response
        .status(200)
        .json({ "Message >>": "Project successfully update!" });
    } catch (error) {
      throw new AppError(error.errors);
    }
  }

  async index(request: Request, response: Response) {
    let { name } = request.query;
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
    const projectsRepository = getCustomRepository(ProjectsRepository);

    let projects = await projectsRepository.find({
      where: request.query, //queries,
    });

    //filtra query pelo id do usuário
    const filterProjects = projects.filter((i) => i.user_id == id);

    if (!projects || projects.length == 0 || filterProjects.length == 0) {
      throw new AppError("Projects not found!!");
    }

    return response.json({ projects: filterProjects });
  }

  async show(request: Request, response: Response) {
    const { id, project_id } = request.params;

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

    //verifica se o Projeto existe
    const projectsRepository = getCustomRepository(ProjectsRepository);

    const projectExists = await projectsRepository.findOne({
      id: String(project_id),
    });

    if (!projectExists) {
      throw new AppError("Project not found!!");
    }

    if (projectExists.user_id != id)
      throw new AppError("Project does not belong to the user!!");

    return response.json({ Navers: projectExists });
  }

  async delete(request: Request, response: Response) {
    const { id, project_id } = request.params;

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

    //verifica se o Projeto existe
    const projectsRepository = getCustomRepository(ProjectsRepository);

    const projectExists = await projectsRepository.findOne({
      id: String(project_id),
    });

    if (!projectExists) {
      throw new AppError("Project not found!!");
    }

    if (projectExists.user_id != id)
      throw new AppError("Project does not belong to the user!!");

    try {
      await getCustomRepository(ProjectsRepository)
        .createQueryBuilder()
        .delete()
        .where("id = :id", { id: projectExists.id })
        .execute();
    } catch (error) {
      throw new AppError(error);
    }

    return response
      .status(200)
      .json({ "Message >>": "Project successfully deleted!" });
  }
}

export { ProjectController };
