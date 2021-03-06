import { Router } from "express";
import { NaverController } from "../controllers/NaverController";
import Auth from "../middlewares/auth";

const naversRouter = Router();

const naverController = new NaverController();

naversRouter.use(Auth);

naversRouter.get("/:id", naverController.index);
naversRouter.get("/:id/:naver_id", naverController.show);
naversRouter.post("/:id", naverController.store);
naversRouter.put("/:id/:naver_id", naverController.update);
naversRouter.delete("/:id/:naver_id", naverController.delete);

export default naversRouter;
