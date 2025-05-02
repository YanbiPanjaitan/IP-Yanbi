const request = require("supertest");
const app = require("../app");
const {sequelize} = require("../models");
const {queryInterface} = sequelize;

beforeAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Reviews", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
});

afterAll(async () => {
  await queryInterface.bulkDelete("Users", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete("Reviews", null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  sequelize.close();
});

describe("authentication middleware edge cases", () => {
  const authenticate = require("../middlewares/authentication");
  let req, res, next;

  beforeEach(() => {
    req = {headers: {authorization: undefined}};
    res = {};
    next = jest.fn();
  });

  it("should call next with Unauthorized if no token", async () => {
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({name: "Unauthorized"})
    );
  });

  it("should call next with Unauthorized if token is invalid", async () => {
    req.headers.authorization = "Bearer invalidtoken";
    jest
      .spyOn(require("../helpers/jwt"), "verifyToken")
      .mockImplementationOnce(() => {
        throw new Error("jwt error");
      });
    await authenticate(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("errorHandler edge cases", () => {
  const errorHandler = require("../middlewares/errorHandler");
  let err, req, res, next;

  beforeEach(() => {
    req = {};
    res = {status: jest.fn().mockReturnThis(), json: jest.fn()};
    next = jest.fn();
  });

  it("should return 400 for Invalid review ID", () => {
    err = {message: "Invalid review ID"};
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({message: "Invalid review ID"});
  });

  it("should return 500 for unknown error", () => {
    err = {message: "Some unknown error"};
    errorHandler(err, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({message: "Internal Server Error"});
  });
});
