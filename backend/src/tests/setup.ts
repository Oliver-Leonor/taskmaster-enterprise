// import { MongoMemoryServer } from "mongodb-memory-server";
// import mongoose from "mongoose";
// import { connectDb } from "../config/db";

// let mongod: MongoMemoryServer;

// beforeAll(async () => {
//   mongod = await MongoMemoryServer.create();
//   process.env.NODE_ENV = "test";
//   process.env.MONGO_URI = mongod.getUri();
//   process.env.JWT_ACCESS_SECRET = "test_access_secret_12345";
//   process.env.JWT_REFRESH_SECRET = "test_refresh_secret_12345";
//   process.env.ACCESS_TOKEN_TTL = "15m";
//   process.env.REFRESH_TOKEN_TTL = "7d";
//   process.env.CORS_ORIGIN = "http://localhost:5173";
//   process.env.PORT = "4000";

//   await connectDb(process.env.MONGO_URI);
// });

// afterEach(async () => {
//   const collections = await mongoose.connection.db.collections();
//   for (const c of collections) {
//     await c.deleteMany({});
//   }
// });

// afterAll(async () => {
//   await mongoose.disconnect();
//   await mongod.stop();
// });
