import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class UserController {
  async store(request: Request, response: Response) {
    const { email, password } = request.body;

    //validações
    const schema = yup.object().shape({
      email: yup.string().email().required("email inválido"),
      password: yup.string().required("Senha é obrigatório"),
    });

    try {
      await schema.validate(request.body, { abortEarly: false });
    } catch (error) {
      throw new AppError(error.errors);
    }

    const usersRepository = getCustomRepository(UsersRepository);

    //verifica se o email ja está cadastrado
    const userAlreadyExists = await usersRepository.findOne({
      email,
    });

    if (userAlreadyExists) {
      throw new AppError("User already exists!!");
    }

    //criar o usuário
    const user = usersRepository.create({
      email,
      password,
    });

    await usersRepository.save(user);

    return response.status(201).json(user);
  }
}

export { UserController };
