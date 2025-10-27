import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { genToken } from "./utils/generateTestToken.js";
import { app } from "../src/app.js";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

describe("Favorite Queries & Mutations", () => {
  let userToken;
  let testNGO;

  beforeAll(async () => {
    await resetDb();

    await prisma.user.create({
      data: {
        id: "user-1",
        full_name: "Favorite Tester",
        email: "favuser@example.com",
        password: "hashedpassword",
        role: "user",
      },
    });

    userToken = genToken({ id: "user-1", email: "favuser@example.com" });


    await prisma.user.create({
      data: {
        id: "organizer-1",
        full_name: "Organizer User",
        email: "organizer@example.com",
        password: "hashedpassword",
        role: "organizer",
      },
    });


    testNGO = await prisma.nGO.create({
      data: {
        id: "ngo-1",
        name: "Favorite NGO",
        cause: "Education",
        description: "An NGO for testing favorites",
        location: "Bangalore",
        contact_info: "9876543210",
        donation_link: "https://donate.example.com",
        ngo_picture: "https://example.com/image.png",
        created_by: "organizer-1",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should allow a logged-in user to add an NGO to favorites", async () => {
    const mutation = `
      mutation {
        addFavorite(ngo_id: "${testNGO.id}") {
          id
          ngo { id name }
          user { id full_name }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.addFavorite).toBeDefined();
    expect(res.body.data.addFavorite.ngo.name).toBe("Favorite NGO");

    const favInDb = await prisma.favorite.findFirst({
      where: { user_id: "user-1", ngo_id: testNGO.id },
    });
    expect(favInDb).not.toBeNull();
  });

  it("should prevent duplicate favorites for the same NGO", async () => {
    const mutation = `
      mutation {
        addFavorite(ngo_id: "${testNGO.id}") {
          id
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/already added/i);
  });

  it("should allow a logged-in user to view their favorite NGOs", async () => {
    const query = `
      query {
        userFavorites {
          id
          ngo { id name cause }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.userFavorites.length).toBeGreaterThan(0);
    expect(res.body.data.userFavorites[0].ngo.name).toBe("Favorite NGO");
  });

  it("should allow a user to remove an NGO from favorites", async () => {
  
  const user = await prisma.User.create({
    data: { full_name: "Remove Tester", email: "remove@example.com", password: "123456", role: "user" },
  });

  const ngo = await prisma.NGO.create({
    data: { name: "Removable NGO", cause: "Health", description: "To remove", created_by: user.id },
  });

  const token = genToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });


  await prisma.Favorite.create({
    data: { user_id: user.id, ngo_id: ngo.id },
  });

  const mutation = `
    mutation {
      removeFavorite(ngo_id: "${ngo.id}") {
        message
      }
    }
  `;

  const res = await request(app)
    .post("/graphql")
    .set("Authorization", `Bearer ${token}`)
    .send({ query: mutation });

  expect(res.statusCode).toBe(200);
  expect(res.body.data.removeFavorite.message).toMatch(/removed/i);

  const favInDb = await prisma.Favorite.findFirst({
    where: { user_id: user.id, ngo_id: ngo.id },
  });
  expect(favInDb).toBeNull();
});


  it("should reject favorite operations without authentication", async () => {
    const mutation = `
      mutation {
        addFavorite(ngo_id: "${testNGO.id}") {
          id
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });
});
