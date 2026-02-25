// import request from "supertest";
// import { createApp } from "../app";

// const app = createApp({
//   corsOrigin: "http://localhost:5173",
//   jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
// });

// describe("Auth", () => {
//   it("register + login returns tokens", async () => {
//     const email = "a@test.com";
//     const password = "Password123";

//     const reg = await request(app)
//       .post("/api/v1/auth/register")
//       .send({ email, password })
//       .expect(201);
//     expect(reg.body.accessToken).toBeTruthy();
//     expect(reg.body.refreshToken).toBeTruthy();

//     const login = await request(app)
//       .post("/api/v1/auth/login")
//       .send({ email, password })
//       .expect(200);
//     expect(login.body.user.email).toBe(email);
//     expect(login.body.accessToken).toBeTruthy();
//   });

//   it("/me requires auth", async () => {
//     await request(app).get("/api/v1/auth/me").expect(401);
//   });
// });
