import { Request, Response } from "express";
import { hash } from "bcryptjs";
import * as yup from "yup";

import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
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

    const passwordHashed = await hash(password, 8);

    //criar o usuário
    const user = usersRepository.create({
      email,
      password: passwordHashed,
    });

    await usersRepository.save(user);

    delete user.password;
    return response.status(201).json(user);
  }
}

export { UserController };
