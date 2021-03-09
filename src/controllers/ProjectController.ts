import { Request, Response } from "express";
import * as yup from "yup";

import { createQueryBuilder, getCustomRepository } from "typeorm";
import { ProjectsRepository } from "../repositories/ProjectsRepository";
import { NaversRepository } from "../repositories/NaversRepository";
import { NaversProjectsRepository } from "../repositories/NaversProjectsRepository";

import { AppError } from "../errors/AppError";
import { Verify } from "../utils/Verify";

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
    const userExists = await new Verify().userExists(String(id));

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
    const userExists = await new Verify().userExists(String(id));

    //verifica se o Projeto existe
    const projectExists = await new Verify().projectExists(id, project_id);

    //atualiza o projeto
    try {
      const project = await createQueryBuilder()
        .update("projects")
        .set({
          name,
          user_id: userExists.id,
        })
        .where("id = :id", { id: projectExists.id })
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
    await new Verify().userExists(String(id));

    //filtra query pelo id do usuário
    const filterProjects = await new Verify().registerOfUser(
      "Project",
      request.query,
      String(id)
    );

    return response.json({ projects: filterProjects });
  }

  async show(request: Request, response: Response) {
    const { id, project_id } = request.params;

    //verifica se o usuario existe
    await new Verify().userExists(String(id));

    //verifica se o Projeto existe
    const projectExists = await new Verify().projectExists(id, project_id);

    return response.json({ Navers: projectExists });
  }

  async delete(request: Request, response: Response) {
    const { id, project_id } = request.params;

    //verifica se o usuario existe
    const userExists = await new Verify().userExists(String(id));

    //verifica se o Projeto existe
    const projectExists = await new Verify().projectExists(id, project_id);

    //deleta projeto
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
