import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { healthRouter } from "./routes/health";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(corsOrigin: string) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan("dev"));

  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
    }),
  );

  app.use("/api/v1", healthRouter);

  app.use(errorHandler);
  return app;
}
