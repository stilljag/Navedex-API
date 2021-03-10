import { Request, Response } from "express";
import * as yup from "yup";

import { createQueryBuilder, getCustomRepository } from "typeorm";
import { ProjectsRepository } from "../repositories/ProjectsRepository";
import { NaversProjectsRepository } from "../repositories/NaversProjectsRepository";

import { AppError } from "../errors/AppError";
import { Verify } from "../utils/Verify";

class ProjectController {
  async store(request: Request, response: Response) {
    const { name, navers } = request.body;
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

    //verifica se o naver existe
    await new Verify().projectExistsNaver("Naver", String(id), navers);

    //criar o project
    const projectRepository = getCustomRepository(ProjectsRepository);

    const project = projectRepository.create({
      name,
      user_id: userExists.id,
    });

    await projectRepository.save(project);

    //cria o naver no banco
    const projectExists = await new Verify().projectExists(id, project.id);

    const naversProjectRepository = getCustomRepository(
      NaversProjectsRepository
    );

    for await (const i of navers) {
      const saveNaver = naversProjectRepository.create({
        project_id: projectExists.id,
        naver_id: i,
      });

      await naversProjectRepository.save(saveNaver);
    }

    return response.status(201).json({ project, navers });
  }

  async update(request: Request, response: Response) {
    const { name, navers } = request.body;

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

    const naversProjectsRepository = getCustomRepository(
      NaversProjectsRepository
    );

    const nave = await naversProjectsRepository.find({
      where: { project_id: String(project_id) },
      relations: ["naverProjectId", "projectId"],
      select: ["project_id", "naverProjectId"],
    });

    const projectsArray = [];
    nave.map((map) => {
      return projectsArray.push(map.naverProjectId.id);
    });

    //verifica se os navers existem
    const naversExists = await new Verify().projectExistsNaver(
      "Naver",
      String(id),
      navers
    );

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

      //deleta navers antigos
      for await (const i of projectsArray) {
        await getCustomRepository(NaversProjectsRepository)
          .createQueryBuilder()
          .delete()
          .where("naver_id = :naver_id", { naver_id: String(i) })
          .execute();
      }

      for await (const i of navers) {
        const saveNaver = naversProjectsRepository.create({
          project_id: projectExists.id,
          naver_id: i,
        });

        await naversProjectsRepository.save(saveNaver);
      }

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

    //verificação de naver

    const naversProjectsRepository = getCustomRepository(
      NaversProjectsRepository
    );

    const nave = await naversProjectsRepository.find({
      where: { project_id: String(project_id) },
      relations: ["naverProjectId", "projectId"],
      select: ["project_id", "naverProjectId"],
    });

    if (nave.length > 0) {
      const data = { nave };
      const projectsArray = [];
      const info = data.nave.map((map) => {
        projectsArray.push({ Id: map.projectId.id, Name: map.projectId.name });
        const data = [
          {
            id: map.naverProjectId.id,
            name: map.naverProjectId.name,
            birthdate: map.naverProjectId.birthdate,
            admission_date: map.naverProjectId.admission_date,
            job_role: map.naverProjectId.job_role,
          },
        ];

        return data;
      });
      const newdata = { Project: projectsArray[0], Navers: info };

      return response.json(newdata);
    } else {
      console.log(projectExists);
      return response.json({ projectExists });
    }
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
