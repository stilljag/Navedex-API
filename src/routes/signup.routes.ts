import { Router } from "express";
import { UserController } from "../controllers/UserController";

const signupRouter = Router();

const userController = new UserController();

signupRouter.post("/", userController.store);

export default signupRouter;
