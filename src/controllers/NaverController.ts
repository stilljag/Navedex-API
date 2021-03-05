import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { NaversRepository } from "../repositories/NaversRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class NaverController {
  async store(request: Request, response: Response) {
    const { name, birthdate, admission_date, job_role } = request.body;
    const id = request.params.id;

    //validações
    const schema = yup.object().shape({
      name: yup.string().required("Nome é obrigatório"),
      birthdate: yup.string().required("Data de nascimento é obrigatório"),
      admission_date: yup.string().required("Data de admissão é obrigatório"),
      job_role: yup.string().required("Função é obrigatório"),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      throw new AppError(error.errors);
    }

    const usersRepository = getCustomRepository(UsersRepository);

    //verifica se o usuario existe
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

    const naversRepository = getCustomRepository(NaversRepository);
    //criar o naver
    const naver = naversRepository.create({
      name,
      birthdate,
      admission_date,
      job_role,
      user_id: userExists.id,
    });

    await naversRepository.save(naver);

    return response.status(201).json(naver);
  }

  async index(request: Request, response: Response) {
    const { name, admission_date, job_role } = request.query;

    const id = request.params.id;
    console.log(name, admission_date, job_role);

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
      user_id: String(id),
      job_role: String(job_role),
    });

    if (!navers) {
      throw new AppError("Navers not found!!");
    }

    if (navers.length == 0) {
      throw new AppError("No navers registration in this user");
    }

    return response.json({ navers });
  }
}

export { NaverController };
