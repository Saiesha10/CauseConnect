import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { genToken } from "./utils/generateTestToken.js";
import { app } from "../src/app.js";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

describe("👤 User Queries & Mutations", () => {
  let userToken;
  let testUser;

  beforeAll(async () => {
    await resetDb();

    testUser = await prisma.user.create({
      data: {
        id: "user-101",
        full_name: "Existing User",
        email: "existing@example.com",
        password: "hashedpassword",
        role: "user",
      },
    });

    userToken = genToken({
      id: testUser.id,
      email: testUser.email,
      role: testUser.role,
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  
  it("should not allow a normal user to fetch all users", async () => {
  const query = `
    query {
      users {
        id
        full_name
        email
        role
      }
    }
  `;

  const res = await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ query });

  expect(res.statusCode).toBe(200);
  expect(res.body.errors).toBeDefined();
  expect(res.body.errors[0].message).toMatch(/not authorized|forbidden/i);
});

  it("should allow fetching a user by ID", async () => {
    const query = `
      query {
        user(id: "${testUser.id}") {
          id
          full_name
          email
          role
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe("existing@example.com");
  });
  it("should allow updating user details", async () => {
    const mutation = `
      mutation {
        updateUser(
          id: "${testUser.id}"
          full_name: "Updated User Name"
          phone: "8888888888"
          description: "Updated description"
        ) {
          id
          full_name
          phone
          description
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateUser.full_name).toBe("Updated User Name");

    const updated = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    expect(updated.full_name).toBe("Updated User Name");
  });


  it("should allow deleting a user", async () => {
    const mutation = `
      mutation {
        deleteUser(id: "${testUser.id}") {
          id
          email
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteUser.id).toBe(testUser.id);

    const deletedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    expect(deletedUser).toBeNull();
  });

  it("should reject fetching users without authentication", async () => {
    const query = `
      query {
        users {
          id
          full_name
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });

  it("should reject login with wrong credentials", async () => {
    const mutation = `
      mutation {
        loginUser(email: "existing@example.com", password: "wrongpassword") {
          token
          user { id email }
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/invalid credentials/i);
  });
});
