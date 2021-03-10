import { Request, Response } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import * as yup from "yup";

import { AppError } from "../errors/AppError";
import { Verify } from "../utils/Verify";

class SessionController {
  async execute(request: Request, response: Response) {
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

    const userExists = new Verify().userExistsLogin(email);

    const matchPassword = await compare(password, (await userExists).password);

    if (!matchPassword) {
      throw new AppError("Incorrect password or username!");
    }

    //criar o token
    const token = sign({}, process.env.SECRET, {
      subject: (await userExists).id,
      expiresIn: 86400,
    });

    delete (await userExists).password;
    return response.status(201).json({
      token,
      user: await userExists,
    });
  }
}

export { SessionController };
