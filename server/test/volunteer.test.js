import request from "supertest";
import app from "../src/app.js";
import { createTestToken } from "./utils/createTestToken.js";
import resetDb from "./utils/resetDb.mjs";

describe("Volunteer Queries & Mutations", () => {
  let userToken, organizerToken, ngoId, eventId;

  beforeAll(async () => {
    await resetDb();
    userToken = createTestToken({ userId: 1, role: "user" });
    organizerToken = createTestToken({ userId: 2, role: "organizer" });
    const ngoRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        query: `
          mutation {
            createNGO(data: {
              name: "Helping Hands",
              cause: "Community Service",
              description: "Helping the local community",
              location: "Bangalore"
            }) {
              id
              name
            }
          }
        `,
      });

    ngoId = ngoRes.body.data.createNGO.id;


    const eventRes = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        query: `
          mutation {
            createEvent(data: {
              ngo_id: ${ngoId},
              title: "Beach Cleanup Drive",
              description: "Volunteer to clean up the beach",
              location: "Marina Beach",
              date: "2025-11-01T10:00:00Z"
            }) {
              id
              title
            }
          }
        `,
      });

    eventId = eventRes.body.data.createEvent.id;
  });

  it("should allow a normal user to register as a volunteer for an event", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        query: `
          mutation {
            registerVolunteer(event_id: ${eventId}) {
              id
              user {
                id
              }
              event {
                id
              }
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.registerVolunteer).toHaveProperty("id");
    expect(res.body.data.registerVolunteer.user.id).toBe("1");
  });

  it("should allow an organizer to volunteer for another event", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        query: `
          mutation {
            registerVolunteer(event_id: ${eventId}) {
              id
              user {
                id
              }
              event {
                id
              }
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.registerVolunteer).toHaveProperty("id");
  });

  it("should prevent duplicate volunteer registration by the same user", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        query: `
          mutation {
            registerVolunteer(event_id: ${eventId}) {
              id
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/already registered/i);
  });

  it("should reject volunteer registration if not authenticated", async () => {
    const res = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            registerVolunteer(event_id: ${eventId}) {
              id
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/not authenticated/i);
  });

  it("should fetch volunteers for a specific event", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${organizerToken}`)
      .send({
        query: `
          query {
            eventVolunteers(event_id: ${eventId}) {
              id
              user {
                id
              }
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.eventVolunteers.length).toBeGreaterThan(0);
  });

  it("should fetch events that a user has volunteered for", async () => {
    const res = await request(app)
      .post("/graphql")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        query: `
          query {
            userVolunteeredEvents {
              id
              title
            }
          }
        `,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.userVolunteeredEvents.length).toBeGreaterThan(0);
  });
});
