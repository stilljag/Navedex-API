import { Router } from "express";

import signupRouter from "./signup.routes";
import loginRouter from "./login.routes";
import naversRouter from "./navers.routes";
import projectsRouter from "./projects.routes";

const routes = Router();

routes.use("/signup", signupRouter);
routes.use("/login", loginRouter);
routes.use("/navers", naversRouter);
routes.use("/projects", projectsRouter);

export default routes;
