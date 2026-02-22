import "dotenv/config";
import { loadEnv } from "./config/env";
import { connectDb } from "./config/db";
import { createApp } from "./app";
import dns from "node:dns/promises";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

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
