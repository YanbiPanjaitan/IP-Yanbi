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
  const {User} = require("../models");
  const {signToken} = require("../helpers/jwt");
  const {comparePassword} = require("../helpers/bcrypt");
  jest.mock("../helpers/jwt");
  jest.mock("../helpers/bcrypt");

  afterEach(() => {
    jest.clearAllMocks();
  });

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

  it("should register a new user", async () => {
    const res = await request(app)
      .post("/register")
      .send({username: "testuser", email: "test@mail.com", password: "12345"});
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body).toHaveProperty("username", "testuser");
    expect(res.body).toHaveProperty("email", "test@mail.com");
  });

  it("should login with correct credentials", async () => {
    const user = await User.create({
      username: "loginuser",
      email: "login@mail.com",
      password: "hashed",
    });
    comparePassword.mockReturnValue(true);
    signToken.mockReturnValue("token");
    const res = await request(app)
      .post("/login")
      .send({email: "login@mail.com", password: "hashed"});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token", "token");
    expect(res.body).toHaveProperty("email", "login@mail.com");
  });

  it("should not login with wrong password", async () => {
    const user = await User.create({
      username: "failuser",
      email: "fail@mail.com",
      password: "hashed",
    });
    comparePassword.mockReturnValue(false);
    const res = await request(app)
      .post("/login")
      .send({email: "fail@mail.com", password: "wrong"});
    expect(res.status).toBe(401);
  });

  it("should not login with missing email", async () => {
    const res = await request(app)
      .post("/login")
      .send({password: "12345"});
    expect(res.status).toBe(400);
  });

  it("should not login with missing password", async () => {
    const res = await request(app)
      .post("/login")
      .send({email: "fail@mail.com"});
    expect(res.status).toBe(400);
  });
});
