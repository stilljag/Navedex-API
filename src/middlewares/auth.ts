import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

import { AppError } from "../errors/AppError";

export default (request: Request, response: Response, next: NextFunction) => {
  const authHeader = request.headers.authorization;
  const id = request.params.id;

  if (!authHeader) {
    throw new AppError("No token provided", 401);
  }

  const [scheme, token] = authHeader.split(" ");

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) throw new AppError("Token Invalid");

    request.userId = decoded.sub;
    process.env.DECODED = request.userId;

    return next();
  });
};
