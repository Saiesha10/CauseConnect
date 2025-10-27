import request from "supertest";
import { PrismaClient } from "../generated/prisma/index.js";
import dotenv from "dotenv";
import { resetDb } from "./utils/resetDb.mjs";
import { genToken } from "./utils/generateTestToken.js";
import { app } from "../src/app.js";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

describe("🎟 Event Queries & Mutations", () => {
  let userToken;
  let organizerToken;
  let testNGO;
  let createdEvent;

  beforeAll(async () => {
    await resetDb();
    await prisma.user.create({
      data: {
        id: "user-1",
        full_name: "Volunteer User",
        email: "volunteer@example.com",
        password: "hashedpassword",
        role: "user",
      },
    });
    userToken = genToken({ id: "user-1", email: "volunteer@example.com" });
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
        name: "Event Test NGO",
        cause: "Education",
        description: "NGO for testing event features",
        location: "Bangalore",
        contact_info: "9999999999",
        donation_link: "https://donate.test",
        ngo_picture: "https://img.test/ngo.png",
        created_by: "organizer-1",
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should allow organizer to create an event for their NGO", async () => {
    const mutation = `
      mutation {
        createEvent(
          ngo_id: "${testNGO.id}",
          title: "Clean-Up Drive",
          description: "Community cleaning event",
          event_date: "2025-11-15",
          location: "Bangalore Park",
          volunteers_needed: 10
        ) {
          id
          title
          ngo { name }
          volunteers_needed
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.createEvent).toBeDefined();
    expect(res.body.data.createEvent.title).toBe("Clean-Up Drive");

    createdEvent = res.body.data.createEvent;

    const eventInDb = await prisma.event.findFirst({
      where: { title: "Clean-Up Drive" },
    });
    expect(eventInDb).not.toBeNull();
  });

  it("should reject event creation for normal users", async () => {
    const mutation = `
      mutation {
        createEvent(
          ngo_id: "${testNGO.id}",
          title: "Unauthorized Event",
          description: "Should not be created",
          event_date: "2025-11-20",
          location: "Mysore",
          volunteers_needed: 5
        ) {
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
    expect(res.body.errors[0].message).toMatch(/not authorized/i);
  });


  it("should list events under the given NGO", async () => {
    const query = `
      query {
        events(organizerId: "organizer-1") {
          id
          title
          location
          ngo { name }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.events.length).toBeGreaterThan(0);
    expect(res.body.data.events[0].ngo.name).toBe("Event Test NGO");
  });

  it("should allow user to register for an event", async () => {
    const mutation = `
      mutation {
        registerVolunteer(event_id: "${createdEvent.id}") {
          id
          event { title }
          user { full_name }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query: mutation });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.registerVolunteer.event.title).toBe("Clean-Up Drive");

    const volunteerInDb = await prisma.eventVolunteer.findFirst({
      where: { user_id: "user-1", event_id: createdEvent.id },
    });
    expect(volunteerInDb).not.toBeNull();
  });

  it("should prevent duplicate event registration by same user", async () => {
    const mutation = `
      mutation {
        registerVolunteer(event_id: "${createdEvent.id}") {
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
    expect(res.body.errors[0].message).toMatch(/already registered/i);
  });


  it("should fetch events the user registered for", async () => {
    const query = `
      query {
        userVolunteers(userId: "user-1") {
          id
          event { title }
        }
      }
    `;

    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.userVolunteers.length).toBeGreaterThan(0);
    expect(res.body.data.userVolunteers[0].event.title).toBe("Clean-Up Drive");
  });


  it("should reject protected queries without a token", async () => {
    const query = `
      query {
        events(organizerId: "organizer-1") {
          id
        }
      }
    `;

    const res = await request(app).post("/graphql").send({ query });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });
});
