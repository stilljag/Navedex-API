import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import Auth from "../middlewares/auth";

const projectsRouter = Router();

const projectController = new ProjectController();

projectsRouter.use(Auth);

projectsRouter.get("/:id", projectController.index);
projectsRouter.get("/:id/:project_id", projectController.show);
projectsRouter.post("/:id", projectController.store);
projectsRouter.put("/:id/:project_id", projectController.update);
projectsRouter.delete("/:id/:project_id", projectController.delete);

export default projectsRouter;
