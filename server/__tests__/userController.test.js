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
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should login with correct credentials", async () => {
      await request(app).post("/register").send({
        username: "loginuser",
        email: "loginuser@mail.com",
        password: "password123",
      });
      jest
        .spyOn(require("../helpers/bcrypt"), "comparePassword")
        .mockReturnValue(true);
      const res = await request(app)
        .post("/login")
        .send({email: "loginuser@mail.com", password: "password123"})
        .expect(200);
      expect(res.body).toHaveProperty("access_token");
      expect(typeof res.body.access_token).toBe("string");
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
      await request(app).post("/register").send({
        username: "wronguser",
        email: "wronguser@mail.com",
        password: "password123",
      });
      jest
        .spyOn(require("../helpers/bcrypt"), "comparePassword")
        .mockReturnValue(false);
      const res = await request(app)
        .post("/login")
        .send({email: "wronguser@mail.com", password: "wrongpass"})
        .expect(401);
      expect(res.body).toHaveProperty("message");
    });

    it("should return 401 if user not found on login", async () => {
      const res = await request(app)
        .post("/login")
        .send({email: "notfound@mail.com", password: "password123"});
      expect(res.status).toBe(401);
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
    jest
      .spyOn(require("../helpers/bcrypt"), "comparePassword")
      .mockReturnValue(true);
    const res = await request(app)
      .post("/login")
      .send({email: "login@mail.com", password: "hashed"});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(typeof res.body.access_token).toBe("string");
    expect(res.body).toHaveProperty("email", "login@mail.com");
  });

  it("should not login with wrong password", async () => {
    const user = await User.create({
      username: "failuser",
      email: "fail@mail.com",
      password: "hashed",
    });
    jest
      .spyOn(require("../helpers/bcrypt"), "comparePassword")
      .mockReturnValue(false);
    const res = await request(app)
      .post("/login")
      .send({email: "fail@mail.com", password: "wrong"});
    expect(res.status).toBe(401);
  });

  it("should not login with missing email", async () => {
    const res = await request(app).post("/login").send({password: "12345"});
    expect(res.status).toBe(400);
  });

  it("should not login with missing password", async () => {
    const res = await request(app)
      .post("/login")
      .send({email: "fail@mail.com"});
    expect(res.status).toBe(400);
  });
});

describe("UserController error cases", () => {
  it("should return 400 if username is missing on register", async () => {
    const res = await request(app)
      .post("/register")
      .send({email: "fail@mail.com", password: "12345"});
    expect(res.status).toBe(400);
  });

  it("should return 400 if email already exists", async () => {
    await request(app).post("/register").send({
      username: "testuser",
      email: "dupe@mail.com",
      password: "12345",
    });
    const res = await request(app).post("/register").send({
      username: "testuser2",
      email: "dupe@mail.com",
      password: "12345",
    });
    expect(res.status).toBe(400);
  });

  it("should return 400 if googleToken is missing", async () => {
    const res = await request(app).post("/auth/google").send({});
    expect(res.status).toBe(400);
  });
});

describe("UserController more edge cases", () => {
  it("should handle error in register (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").User, "create")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .post("/register")
      .send({username: "erruser", email: "err@mail.com", password: "12345"});
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in login (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").User, "findOne")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .post("/login")
      .send({email: "err@mail.com", password: "12345"});
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in googleLogin (simulate DB error)", async () => {
    jest
      .spyOn(require("../models").User, "findOne")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .post("/auth/google")
      .send({googleToken: "sometoken"});
    expect(res.status).toBe(500);
    jest.clearAllMocks();
  });
});

describe("UserController 100% coverage", () => {
  it("should return 401 if user not found on login", async () => {
    const res = await request(app)
      .post("/login")
      .send({email: "notfound@mail.com", password: "password123"});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 401 if password is invalid on login", async () => {
    const user = await User.create({
      username: "wrongpassuser",
      email: "wrongpass@mail.com",
      password: "hashedpass",
    });
    jest
      .spyOn(require("../helpers/bcrypt"), "comparePassword")
      .mockReturnValue(false);
    jest.spyOn(require("../helpers/jwt"), "signToken").mockReturnValue("token");
    const res = await request(app)
      .post("/login")
      .send({email: "wrongpass@mail.com", password: "wrong"});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 400 if googleToken is missing in googleLogin", async () => {
    const res = await request(app).post("/auth/google").send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});

describe("UserController googleLogin edge cases", () => {
  it("should return 500 if verifyIdToken throws error", async () => {
    const {OAuth2Client} = require("google-auth-library");
    jest
      .spyOn(OAuth2Client.prototype, "verifyIdToken")
      .mockImplementationOnce(() => {
        throw new Error("Google error");
      });
    const res = await request(app)
      .post("/auth/google")
      .send({googleToken: "invalid"});
    expect(res.status).toBe(500);
  });

  it("should create user if not found after google login", async () => {
    const {OAuth2Client} = require("google-auth-library");
    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValueOnce({
      getPayload: () => ({
        email: "newgoogle@mail.com",
      }),
    });
    jest
      .spyOn(require("../models").User, "findOne")
      .mockResolvedValueOnce(null);
    jest.spyOn(require("../models").User, "create").mockResolvedValueOnce({
      id: 123,
      email: "newgoogle@mail.com",
      username: "newgoogle",
      password: "random",
    });
    const res = await request(app)
      .post("/auth/google")
      .send({googleToken: "valid"});
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("access_token");
    expect(typeof res.body.access_token).toBe("string");
  });
});
