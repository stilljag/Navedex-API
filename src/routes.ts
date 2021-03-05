import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { SessionController } from "./controllers/SessionController";
import { NaverController } from "./controllers/NaverController";
import Auth from "./middlewares/auth";

const router = Router();

const userController = new UserController();
const sessionController = new SessionController();
const naverController = new NaverController();

router.post("/signup", userController.store);
router.post("/login", sessionController.store);

router.use(Auth);

router.get("/navers/:id", naverController.index);
router.post("/navers/:id", naverController.store);

export { router };
