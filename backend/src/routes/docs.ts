import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openapi } from "../docs/openapi";

export const docsRouter = Router();

docsRouter.get("/openapi.json", (_req, res) => res.json(openapi));
docsRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
