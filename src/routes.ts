import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { SessionController } from "./controllers/SessionController";

const router = Router();

const userController = new UserController();
const sessionController = new SessionController();

router.post("/signup", userController.store);
router.post("/login", sessionController.store);

export { router };
