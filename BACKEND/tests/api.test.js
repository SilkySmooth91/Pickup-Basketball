import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js"; 
import "dotenv/config";

let token;
let userId;
let friendToken;
let friendId;
let courtId;
let eventId;
let commentId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI_TEST); //uri su database di test separato da quello di sviluppo 
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe("Auth", () => {
  it("Register user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "testuser",
        email: "testuser@email.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        age: 20,
        city: "Roma"
      });
    expect(res.status).toBe(201);
    userId = res.body.user.id;
  });

  it("Login user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "testuser@email.com",
        password: "Password123!"
      });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    token = res.body.accessToken;
  });
});

describe("Courts", () => {
  it("Create court", async () => {
    const res = await request(app)
      .post("/courts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Court",
        address: "Via Roma 1",
        coordinates: { lat: 41.9, lng: 12.5 },
        baskets: 2,
        officialsize: true,
        nightlights: false
      });
    expect(res.status).toBe(201);
    courtId = res.body._id;
  });
});

describe("Events", () => {
  it("Create event", async () => {
    const res = await request(app)
      .post("/events")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Event",
        description: "Partita di prova",
        court: courtId,
        datetime: new Date(),
        maxplayers: 10,
        isprivate: false
      });
    expect(res.status).toBe(201);
    eventId = res.body._id;
  });
});

describe("Friends", () => {
  it("Register second user", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({
        username: "frienduser",
        email: "friend@email.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        age: 21,
        city: "Milano"
      });
    expect(res.status).toBe(201);
    friendId = res.body.user.id;
  });

  it("Login second user", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "friend@email.com",
        password: "Password123!"
      });
    expect(res.status).toBe(200);
    friendToken = res.body.accessToken;
  });

  it("Send friend request", async () => {
    const res = await request(app)
      .post("/friends/requests")
      .set("Authorization", `Bearer ${token}`)
      .send({ to: friendId });
    expect(res.status).toBe(201);
  });

  it("Accept friend request", async () => {
    // Recupera la richiesta
    const reqs = await request(app)
      .get("/friends/requests/received")
      .set("Authorization", `Bearer ${friendToken}`);
    const reqId = reqs.body[0]._id;
    const res = await request(app)
      .post(`/friends/requests/${reqId}/accept`)
      .set("Authorization", `Bearer ${friendToken}`);
    expect(res.status).toBe(200);
  });
});

describe("Comments", () => {
  it("Add comment to event", async () => {
    const res = await request(app)
      .post("/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        text: "Grande evento!",
        target: "Events",
        targetid: eventId
      });
    expect(res.status).toBe(201);
    commentId = res.body._id;
  });

  it("Get comments for event", async () => {
    const res = await request(app)
      .get(`/comments/Events/${eventId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});