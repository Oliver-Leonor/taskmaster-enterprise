// backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { healthRouter } from "./routes/health";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth";

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

  app.use("/api/v1/auth", authRouter);

  // 404 + error handler LAST
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
