import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { app } from "../src/app.js";
import bcrypt from "bcryptjs";


dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

beforeAll(async () => {
  await resetDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("User Authentication (signUpUser, loginUser, JWT auth)", () => {
  beforeEach(async () => {
    await resetDb();
  });

  
  it("should successfully sign up a new user", async () => {
    const mutation = `
      mutation {
        signUpUser(
          email: "newuser@example.com",
          full_name: "New User",
          password: "password123",
          role: "donor"
        ) {
          token
          user {
            id
            full_name
            email
            role
          }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.signUpUser.token).toBeDefined();
    expect(res.body.data.signUpUser.user.email).toBe("newuser@example.com");

    const user = await prisma.user.findUnique({
      where: { email: "newuser@example.com" },
    });
    expect(user).not.toBeNull();
    expect(user.password).not.toBe("password123"); 
  });

 
  it("should fail to sign up with an existing email", async () => {
    await prisma.user.create({
      data: {
        full_name: "Existing User",
        email: "exists@example.com",
        password: "hashedpass",
        role: "donor",
      },
    });

    const mutation = `
      mutation {
        signUpUser(
          email: "exists@example.com",
          full_name: "New User",
          password: "password123",
          role: "donor"
        ) {
          token
          user {
            id
          }
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/already exists/i);
  });



it("should login a user with correct credentials", async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: {
      id: "user-login",
      full_name: "Login User",
      email: "login@example.com",
      password: hashedPassword,
      role: "donor",
    },
  });

  const mutation = `
    mutation {
      loginUser(email: "login@example.com", password: "password123") {
        token
        user {
          id
          email
        }
      }
    }
  `;

  const res = await request(app).post("/graphql").send({ query: mutation });

  expect(res.statusCode).toBe(200);
  expect(res.body.data.loginUser.token).toBeDefined();
  expect(res.body.data.loginUser.user.email).toBe("login@example.com");
});



  it("should fail login with wrong credentials", async () => {
    const mutation = `
      mutation {
        loginUser(email: "wrong@example.com", password: "incorrect") {
          token
          user {
            id
            email
          }
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/invalid credentials/i);
  });

 
  it("should reject queries without a valid token", async () => {
    const query = `
      query {
        ngos {
          id
          name
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .send({ query });
    console.log("Unauthorized response:", res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });
});
