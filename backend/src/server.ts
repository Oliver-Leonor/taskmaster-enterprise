import "dotenv/config";
import { loadEnv } from "./config/env";
import { connectDb } from "./config/db";
import { createApp } from "./app";

async function main() {
  const env = loadEnv();
  await connectDb(env.MONGO_URI);

  const app = createApp(env.CORS_ORIGIN);
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
