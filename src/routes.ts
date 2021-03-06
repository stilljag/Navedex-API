import { Router } from "express";
import { UserController } from "./controllers/UserController";
import { SessionController } from "./controllers/SessionController";
import { NaverController } from "./controllers/NaverController";
import { ProjectController } from "./controllers/ProjectController";

import Auth from "./middlewares/auth";

const router = Router();

const userController = new UserController();
const sessionController = new SessionController();
const naverController = new NaverController();
const projectController = new ProjectController();

router.post("/signup", userController.store);
router.post("/login", sessionController.store);

router.use(Auth);
//navers
router.get("/navers/:id", naverController.index);
router.get("/navers/:id/:naver_id", naverController.show);
router.post("/navers/:id", naverController.store);
router.put("/navers/:id/:naver_id", naverController.update);
router.delete("/navers/:id/:naver_id", naverController.delete);

//projects
router.get("/projects/:id", projectController.index);
router.get("/projects/:id/:project_id", projectController.show);
router.post("/projects/:id", projectController.store);
router.put("/projects/:id/:project_id", projectController.update);
router.delete("/projects/:id/:project_id", projectController.delete);

export { router };
