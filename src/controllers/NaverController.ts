import { Request, Response } from "express";
import moment from "moment";
import * as yup from "yup";

import { createQueryBuilder, getCustomRepository } from "typeorm";

import { NaversRepository } from "../repositories/NaversRepository";
import { NaversProjectsRepository } from "../repositories/NaversProjectsRepository";

import { AppError } from "../errors/AppError";
import { Verify } from "../utils/Verify";

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
    const userExists = await new Verify().userExists(String(id));

    //verifica se os projetos existem
    await new Verify().projectExistsNaver(String(id), projects);

    //cria o naver

    const naversRepository = getCustomRepository(NaversRepository);
    const naver = naversRepository.create({
      name,
      birthdate: moment(birthdate).format("MM/DD/yyyy"),
      admission_date: moment(admission_date).format("MM/DD/yyyy"),
      job_role,
      user_id: userExists.id,
    });

    await naversRepository.save(naver);

    ///cria o projeto
    const naverExists = await new Verify().naverExists(id, naver.id);
    const naversProjectRepository = getCustomRepository(
      NaversProjectsRepository
    );

    for await (const i of projects) {
      const saveProject = naversProjectRepository.create({
        naver_id: naverExists.id,
        project_id: i,
      });

      await naversProjectRepository.save(saveProject); //, saveProject
    }

    return response.status(201).json({ naver, projects });
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
    const userExists = await new Verify().userExists(String(id));

    //verifica se o Naver existe
    const naverExists = await new Verify().naverExists(id, naver_id);

    const naversProjectsRepository = getCustomRepository(
      NaversProjectsRepository
    );
    const nave = await naversProjectsRepository.find({
      where: { naver_id: String(naver_id) },
      relations: ["naverProjectId", "projectId"],
      select: ["project_id", "naverProjectId"],
    });

    const projectsArray = [];
    nave.map((map) => {
      return projectsArray.push(map.projectId.id);
    });

    //verifica se os projetos existem
    const projectExists = await new Verify().projectExistsNaver(
      String(id),
      projects
    );

    try {
      const naver = await createQueryBuilder()
        .update("navers")
        .set({
          name,
          birthdate: moment(birthdate).format("MM/DD/yyyy"),
          admission_date: moment(admission_date).format("MM/DD/yyyy"),
          job_role,
          user_id: userExists.id,
        })
        .where("id = :id", { id: naverExists.id })
        .execute();

      //deleta projetos antigos

      for await (const i of projectsArray) {
        await getCustomRepository(NaversProjectsRepository)
          .createQueryBuilder()
          .delete()
          .where("project_id = :project_id", { project_id: String(i) })
          .execute();
      }

      for await (const i of projects) {
        const saveProject = naversProjectsRepository.create({
          naver_id: naverExists.id,
          project_id: i,
        });

        await naversProjectsRepository.save(saveProject); //, saveProject
      }

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
    await new Verify().userExists(String(id));

    //filtra query pelo id do usuário
    const filterNavers = await new Verify().registerOfUser(
      "Naver",
      request.query,
      String(id)
    );

    return response.json({ Navers: filterNavers });
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { id, naver_id } = request.params;

    //verifica se o usuario existe
    await new Verify().userExists(String(id));

    //verifica se o Naver existe
    const naverExists = await new Verify().naverExists(id, naver_id);

    const naversProjectsRepository = getCustomRepository(
      NaversProjectsRepository
    );
    const nave = await naversProjectsRepository.find({
      where: { naver_id: String(naver_id) },
      relations: ["naverProjectId", "projectId"],
      select: ["project_id", "naverProjectId"],
    });

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
    const newdata = { Naver: info[0], Projects: projectsArray };

    return response.json(newdata);
  }

  async delete(request: Request, response: Response) {
    const { id, naver_id } = request.params;

    //verifica se o usuario existe
    await new Verify().userExists(String(id));

    //verifica se o Naver existe
    const naverExists = await new Verify().naverExists(id, naver_id);

    //deleta o naver
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
