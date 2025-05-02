const request = require("supertest");
const app = require("../app");
const {sequelize, User} = require("../models");

beforeAll(async () => {
  await User.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
});

afterAll(async () => {
  await User.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});

describe("UserController", () => {
  describe("POST /register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/register")
        .send({
          username: "testuser",
          email: "testuser@mail.com",
          password: "password123",
        })
        .expect(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("username", "testuser");
      expect(res.body).toHaveProperty("email", "testuser@mail.com");
    });
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/register")
        .send({username: "testuser2", password: "password123"})
        .expect(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /login", () => {
    it("should login with correct credentials", async () => {
      await request(app).post("/register").send({
        username: "loginuser",
        email: "loginuser@mail.com",
        password: "password123",
      });
      const res = await request(app)
        .post("/login")
        .send({email: "loginuser@mail.com", password: "password123"})
        .expect(200);
      expect(res.body).toHaveProperty("access_token");
      expect(res.body).toHaveProperty("email", "loginuser@mail.com");
    });
    it("should return 400 if email is missing", async () => {
      const res = await request(app)
        .post("/login")
        .send({password: "password123"})
        .expect(400);
      expect(res.body).toHaveProperty("message");
    });
    it("should return 400 if password is missing", async () => {
      const res = await request(app)
        .post("/login")
        .send({email: "loginuser@mail.com"})
        .expect(400);
      expect(res.body).toHaveProperty("message");
    });
    it("should return 401 for wrong credentials", async () => {
      const res = await request(app)
        .post("/login")
        .send({email: "loginuser@mail.com", password: "wrongpass"})
        .expect(401);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /auth/google", () => {
    it("should return 400 if googleToken is missing", async () => {
      const res = await request(app).post("/auth/google").send({}).expect(400);
      expect(res.body).toHaveProperty("message");
    });
  });
});
