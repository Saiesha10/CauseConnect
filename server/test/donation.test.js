import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { genToken } from "./utils/generateTestToken.js";
import { app } from "../src/app.js";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

describe("💰 Donation Queries & Mutations", () => {
  let userToken;
  let organizerToken;
  let testNGO;

  beforeAll(async () => {
    await resetDb();

  
    await prisma.user.create({
      data: {
        id: "user-1",
        full_name: "Donor User",
        email: "donor@example.com",
        password: "hashedpassword",
        role: "user",
      },
    });

    userToken = genToken({ id: "user-1", email: "donor@example.com" });


    await prisma.user.create({
      data: {
        id: "organizer-1",
        full_name: "Organizer User",
        email: "organizer@example.com",
        password: "hashedpassword",
        role: "organizer",
      },
    });

    organizerToken = genToken({
      id: "organizer-1",
      email: "organizer@example.com",
      role: "organizer",
    });


    testNGO = await prisma.nGO.create({
      data: {
        id: "ngo-1",
        name: "Donation Test NGO",
        cause: "Health",
        description: "Testing donations",
        location: "Bangalore",
        contact_info: "9876543210",
        donation_link: "https://donate.example.com",
        ngo_picture: "https://example.com/img.png",
        created_by: "organizer-1",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should allow a logged-in user to donate to an NGO", async () => {
    const mutation = `
      mutation {
        donateToNGO(ngo_id: "${testNGO.id}", amount: 500.0, message: "Keep up the great work!") {
          id
          amount
          message
          ngo { id name }
          user { id full_name email }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.donateToNGO).toBeDefined();
    expect(res.body.data.donateToNGO.amount).toBe(500.0);
    expect(res.body.data.donateToNGO.ngo.name).toBe("Donation Test NGO");

    const donationInDb = await prisma.donation.findFirst({
      where: { user_id: "user-1", ngo_id: testNGO.id },
    });
    expect(donationInDb).not.toBeNull();
  });


  it("should fetch donations made by the logged-in user", async () => {
    const query = `
      query {
        userDonations {
          id
          amount
          message
          ngo { name }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.userDonations.length).toBeGreaterThan(0);
    expect(res.body.data.userDonations[0].ngo.name).toBe("Donation Test NGO");
  });


  it("should fetch donations for NGOs created by the organizer", async () => {
    const query = `
      query {
        organizerDonations {
          id
          amount
          message
          user { full_name }
          ngo { name }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.organizerDonations.length).toBeGreaterThan(0);
    expect(res.body.data.organizerDonations[0].ngo.name).toBe("Donation Test NGO");
  });


  it("should reject donation queries without a valid token", async () => {
    const query = `
      query {
        userDonations {
          id
          amount
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });

 
  it("should reject if a normal user tries to access organizer donations", async () => {
    const query = `
      query {
        organizerDonations {
          id
          amount
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authorized/i);
  });
});
