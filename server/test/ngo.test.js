import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { genToken } from "./utils/generateTestToken.js";
import { app } from "../src/app.js";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

describe("GraphQL NGO Queries & Mutations", () => {
  let token;

  beforeAll(async () => {
    await resetDb();
  });

  beforeEach(async () => {
    await resetDb();
    await prisma.user.create({
      data: {
        id: "user-1",
        full_name: "Test User",
        email: "test@example.com",
        password: "hashedpassword",
        role: "organizer",
      },
    });

 
    token = genToken({ id: "user-1", email: "test@example.com" });

    await prisma.nGO.create({
      data: {
        id: "ngo-1",
        name: "Helping Hands",
        cause: "Education",
        description: "An NGO helping with education.",
        location: "Bangalore",
        contact_info: "9999999999",
        donation_link: "https://donate.example.com",
        created_by: "user-1",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });


  it("should fetch NGOs successfully", async () => {
    const query = `
      query ngos {
        ngos {
          id
          name
          cause
          description
          location
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("data.ngos");
    expect(res.body.data.ngos.length).toBeGreaterThan(0);
    expect(res.body.data.ngos[0].name).toBe("Helping Hands");
  });
  it("should create a new NGO successfully", async () => {
    const mutation = `
      mutation createNGO {
        createNGO(
          name: "Save The Earth"
          cause: "Environment"
          description: "An NGO focused on environmental protection."
          location: "Delhi"
          contact_info: "8888888888"
          donation_link: "https://donate.saveearth.com"
          ngo_picture: "https://example.com/image.jpg"
        ) {
          id
          name
          cause
          location
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createNGO.name).toBe("Save The Earth");

    const ngoInDb = await prisma.nGO.findFirst({
      where: { name: "Save The Earth" },
    });
    expect(ngoInDb).not.toBeNull();
  });

  it("should update an existing NGO successfully", async () => {
    const mutation = `
      mutation updateNGO {
        updateNGO(
          id: "ngo-1"
          name: "Helping Hands Foundation"
          description: "Updated NGO description."
          location: "Mumbai"
        ) {
          id
          name
          description
          location
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.updateNGO.name).toBe("Helping Hands Foundation");

    const updatedNgo = await prisma.nGO.findUnique({
      where: { id: "ngo-1" },
    });
    expect(updatedNgo.name).toBe("Helping Hands Foundation");
    expect(updatedNgo.location).toBe("Mumbai");
  });


  it("should delete an existing NGO successfully", async () => {
    const mutation = `
      mutation deleteNGO {
        deleteNGO(id: "ngo-1") {
          id
          name
        }
      }
    `;


    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.deleteNGO.id).toBe("ngo-1");

    const deletedNgo = await prisma.nGO.findUnique({
      where: { id: "ngo-1" },
    });
    expect(deletedNgo).toBeNull();

    const fetchQuery = `
      query ngos {
        ngos {
          id
          name
        }
      }
    `;
    const fetchRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: fetchQuery });

    expect(fetchRes.statusCode).toBe(200);
    const ngoList = fetchRes.body.data.ngos;
    expect(ngoList.find((ngo) => ngo.id === "ngo-1")).toBeUndefined();
  });
});
