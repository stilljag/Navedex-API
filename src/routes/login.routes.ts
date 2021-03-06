import { Router } from "express";
import { SessionController } from "../controllers/SessionController";

const loginRouter = Router();

const sessionController = new SessionController();

loginRouter.post("/", sessionController.execute);

export default loginRouter;
