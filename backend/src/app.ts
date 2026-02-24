// backend/src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { logger } from "./config/logger";
import { requestId } from "./middleware/requestId";

import { healthRouter } from "./routes/health";
import { createAuthRouter } from "./routes/auth";
import { createTasksRouter } from "./routes/tasks";

import { docsRouter } from "./routes/docs";

import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";

export function createApp(opts: {
  corsOrigin: string;
  jwtAccessSecret: string;
}) {
  const app = express();

  // 1) request id FIRST (so every log + error has it)
  app.use(requestId);

  // 2) security + parsing
  app.use(helmet());
  app.use(cors({ origin: opts.corsOrigin, credentials: true }));
  app.use(express.json());

  // 3) log requests via morgan -> winston (with request id)
  morgan.token("rid", (req) => (req as any).requestId || "-");

  app.use(
    morgan(
      ":method :url :status :res[content-length] - :response-time ms rid=:rid",
      {
        stream: {
          write: (message) => logger.info(message.trim()),
        },
      },
    ),
  );

  // 4) rate limiting
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
    }),
  );

  // 5) routes
  app.use("/api/v1", healthRouter);

  app.use("/api/v1", docsRouter);

  app.use(
    "/api/v1/auth",
    createAuthRouter({ jwtAccessSecret: opts.jwtAccessSecret }),
  );
  app.use(
    "/api/v1/tasks",
    createTasksRouter({ jwtAccessSecret: opts.jwtAccessSecret }),
  );

  // 6) 404 + error handler LAST
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
