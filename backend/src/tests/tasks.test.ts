import request from "supertest";
import bcrypt from "bcrypt";
import { createApp } from "../app";
import { createUser } from "../repositories/user.repository";

const app = createApp({
  corsOrigin: "http://localhost:5173",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
});

async function registerAndLogin(email: string) {
  const password = "Password123";
  await request(app)
    .post("/api/v1/auth/register")
    .send({ email, password })
    .expect(201);
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);
  return { token: login.body.accessToken as string, password };
}

async function createManager(email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  await createUser({ email, passwordHash, role: "manager" });
  const login = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);
  return { token: login.body.accessToken as string };
}

describe("Tasks", () => {
  it("user sees only own tasks; manager can see all", async () => {
    const a = await registerAndLogin("u1@test.com");
    const b = await registerAndLogin("u2@test.com");

    const t1 = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${a.token}`)
      .send({ title: "A task", status: "todo" })
      .expect(201);

    await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${b.token}`)
      .send({ title: "B task", status: "todo" })
      .expect(201);

    // user A list -> only 1
    const listA = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);
    expect(listA.body.total).toBe(1);

    // user A cannot fetch user B task by id (scoped as not found)
    const bTaskId = (
      await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${b.token}`)
        .expect(200)
    ).body.items[0].id;

    await request(app)
      .get(`/api/v1/tasks/${bTaskId}`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(404);

    // manager can see all
    const mgr = await createManager("mgr@test.com", "Password123");
    const listMgr = await request(app)
      .get("/api/v1/tasks?deleted=include")
      .set("Authorization", `Bearer ${mgr.token}`)
      .expect(200);

    expect(listMgr.body.total).toBe(2);
    expect(t1.body.task.id).toBeTruthy();
  });

  it("soft delete hides by default; manager can include/only deleted", async () => {
    const a = await registerAndLogin("u3@test.com");

    const created = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${a.token}`)
      .send({ title: "Delete me", status: "todo" })
      .expect(201);

    const id = created.body.task.id;

    await request(app)
      .delete(`/api/v1/tasks/${id}`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);

    const listA = await request(app)
      .get("/api/v1/tasks")
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);
    expect(listA.body.total).toBe(0);

    const mgr = await createManager("mgr2@test.com", "Password123");
    const onlyDeleted = await request(app)
      .get("/api/v1/tasks?deleted=only")
      .set("Authorization", `Bearer ${mgr.token}`)
      .expect(200);

    expect(onlyDeleted.body.total).toBe(1);
  });

  it("optimistic concurrency returns 409 on stale updatedAt", async () => {
    const a = await registerAndLogin("u4@test.com");

    const created = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${a.token}`)
      .send({ title: "Concurrency", status: "todo" })
      .expect(201);

    const id = created.body.task.id;
    const updatedAt = created.body.task.updatedAt;

    // first update ok
    const first = await request(app)
      .patch(`/api/v1/tasks/${id}`)
      .set("Authorization", `Bearer ${a.token}`)
      .set("If-Unmodified-Since", updatedAt)
      .send({ title: "Concurrency 1" })
      .expect(200);

    // second update with stale timestamp -> 409
    await request(app)
      .patch(`/api/v1/tasks/${id}`)
      .set("Authorization", `Bearer ${a.token}`)
      .set("If-Unmodified-Since", updatedAt) // stale
      .send({ title: "Concurrency 2" })
      .expect(409);

    expect(first.body.task.title).toBe("Concurrency 1");
  });

  it("pagination works", async () => {
    const a = await registerAndLogin("u5@test.com");

    for (let i = 0; i < 25; i++) {
      await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${a.token}`)
        .send({ title: `T${i}`, status: "todo" })
        .expect(201);
    }

    const page2 = await request(app)
      .get("/api/v1/tasks?page=2&limit=10")
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);

    expect(page2.body.items.length).toBe(10);
    expect(page2.body.total).toBe(25);
  });
});
