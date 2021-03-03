import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import * as yup from "yup";
import { AppError } from "../errors/AppError";

class SessionController {
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

    //verifica se o usuário existe
    const userExists = await usersRepository.findOne({
      email,
    });

    if (!userExists) {
      throw new AppError("User not found!!");
    }

    //verificar password
    const matchPassword = await compare(password, userExists.password);

    if (!matchPassword) {
      throw new AppError("Incorrect password or username!");
    }

    //criar o token
    const token = sign({}, "df55340f75b5da454e1c189d56d7f31b", {
      subject: userExists.id,
      expiresIn: "1d",
    });

    delete userExists.password;
    return response.status(201).json({
      token,
      userExists,
    });
  }
}

export { SessionController };
