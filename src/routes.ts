import { Router, Request, Response } from "express";
import { UserController } from "./controllers/UserController";
import { SessionController } from "./controllers/SessionController";
import auth from "./middlewares/auth";

const router = Router();

const userController = new UserController();
const sessionController = new SessionController();

router.post("/signup", userController.store);
router.post("/login", sessionController.store);

router.use(auth);

router.get("/", (request: Request, response: Response) => {
  return response.json("autenticou");
});

export { router };
