const request = require("supertest");
const app = require("../app");
const {sequelize, User, Country, Review} = require("../models");
const {signToken} = require("../helpers/jwt");

jest.mock("../middlewares/guardOwner", () => (req, res, next) => next());

let user, token, country, review;

beforeAll(async () => {
  await sequelize.sync({force: true});
  user = await User.create({
    username: "reviewer",
    email: "reviewer@mail.com",
    password: "password123",
  });
  token = signToken({id: user.id, email: user.email});
  country = await Country.create({
    name: "Testland",
    region: "TestRegion",
    capital: "TestCity",
    population: 123456,
    flagUrl: "https://example.com/flag.png",
    latitude: 1.23,
    longitude: 4.56,
  });
  review = await Review.create({
    userId: user.id,
    countryId: country.id,
    rating: 5,
    comment: "Great place!",
  });
});

afterAll(async () => {
  await Review.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });

  await Country.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await User.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});

describe("ReviewController", () => {
  describe("GET /countries/:id/reviews", () => {
    it("should return reviews for a country", async () => {
      const res = await request(app).get(`/countries/${country.id}/reviews`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it("should return empty array if no reviews", async () => {
      const newCountry = await Country.create({
        name: "NoReviewLand",
        region: "Nowhere",
        capital: "None",
        population: 1,
        flagUrl: "none",
        latitude: 0,
        longitude: 0,
      });
      const res = await request(app).get(`/countries/${newCountry.id}/reviews`);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe("POST /countries/:id/reviews", () => {
    it("should create a review (auth required)", async () => {
      const res = await request(app)
        .post(`/countries/${country.id}/reviews`)
        .set("Authorization", `Bearer ${token}`)
        .send({rating: 4, comment: "Nice place!"});
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("comment", "Nice place!");
    });
    it("should fail if not authenticated", async () => {
      const res = await request(app)
        .post(`/countries/${country.id}/reviews`)
        .send({rating: 4, comment: "No token"});
      expect(res.status).toBe(401);
    });
    it("should fail if missing fields", async () => {
      const res = await request(app)
        .post(`/countries/${country.id}/reviews`)
        .set("Authorization", `Bearer ${token}`)
        .send({rating: 4});
      expect(res.status).toBe(400);
    });
  });

  describe("PUT /reviews/:id", () => {
    it("should update a review (auth required)", async () => {
      const newReview = await Review.create({
        userId: user.id,
        countryId: country.id,
        rating: 3,
        comment: "Old comment",
      });
      const res = await request(app)
        .put(`/reviews/${newReview.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({rating: 5, comment: "Updated comment"});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("comment", "Updated comment");
    });
    it("should fail if not authenticated", async () => {
      const res = await request(app)
        .put(`/reviews/${review.id}`)
        .send({rating: 2, comment: "No token"});
      expect(res.status).toBe(401);
    });
    it("should fail if review not found", async () => {
      const res = await request(app)
        .put(`/reviews/99999`)
        .set("Authorization", `Bearer ${token}`)
        .send({rating: 2, comment: "Not found comment"});
      expect(res.status).toBe(404);
    });
    it("should return 400 if comment is missing on update", async () => {
      const user = await require("../models").User.create({
        username: "reviewupdatecomment",
        email: "reviewupdatecomment@mail.com",
        password: "password123"
      });
      const { signToken } = require("../helpers/jwt");
      const token = signToken({ id: user.id, email: user.email });
      const review = await require("../models").Review.create({
        userId: user.id,
        countryId: 1,
        rating: 3,
        comment: "valid comment"
      });
      const res = await request(app)
        .put(`/reviews/${review.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ rating: 5 }); // comment missing
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("DELETE /reviews/:id", () => {
    it("should delete a review (auth required)", async () => {
      const newReview = await Review.create({
        userId: user.id,
        countryId: country.id,
        rating: 1,
        comment: "To be deleted",
      });
      const res = await request(app)
        .delete(`/reviews/${newReview.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
    });
    it("should fail if not authenticated", async () => {
      const res = await request(app).delete(`/reviews/${review.id}`);
      expect(res.status).toBe(401);
    });
    it("should fail if review not found", async () => {
      const res = await request(app)
        .delete(`/reviews/99999`)
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });
});

describe("ReviewController error cases", () => {
  it("should return 400 if rating or comment is missing on create", async () => {
    // Assume you have a valid token and countryId
    const user = await require("../models").User.create({
      username: "reviewreview",
      email: "reviewreview@mail.com",
      password: "password123",
    });
    const country = await require("../models").Country.create({
      name: "ReviewLand",
      region: "Asia",
      capital: "ReviewCity",
      population: 10,
      flagUrl: "review.png",
      latitude: 1,
      longitude: 1,
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const res = await request(app)
      .post(`/countries/${country.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({rating: 5}); // comment missing
    expect(res.status).toBe(400);
  });

  it("should return 400 if review id is invalid on delete", async () => {
    const user = await require("../models").User.create({
      username: "reviewdelete",
      email: "reviewdelete@mail.com",
      password: "password123",
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const res = await request(app)
      .delete("/reviews/invalid")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
  });

  it("should return 404 if review not found on update", async () => {
    const user = await require("../models").User.create({
      username: "reviewupdate",
      email: "reviewupdate@mail.com",
      password: "password123",
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const res = await request(app)
      .put("/reviews/9999")
      .set("Authorization", `Bearer ${token}`)
      .send({rating: 4, comment: "update"});
    expect(res.status).toBe(404);
  });
});

describe("ReviewController additional error cases", () => {
  it("should handle error in getByCountryId (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Review, "findAll")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get(`/countries/1/reviews`);
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in create (simulate DB error)", async () => {
    // Setup user, token, and country
    const user = await require("../models").User.create({
      username: "reviewcreateerr",
      email: "reviewcreateerr@mail.com",
      password: "password123",
    });
    const country = await require("../models").Country.create({
      name: "ReviewCreateErrLand",
      region: "Asia",
      capital: "ReviewCity",
      population: 10,
      flagUrl: "review.png",
      latitude: 1,
      longitude: 1,
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const spy = jest
      .spyOn(require("../models").Review, "create")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .post(`/countries/${country.id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({rating: 5, comment: "valid comment"});
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in update (simulate DB error)", async () => {
    const user = await require("../models").User.create({
      username: "reviewupdateerr",
      email: "reviewupdateerr@mail.com",
      password: "password123",
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const spy = jest
      .spyOn(require("../models").Review, "update")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .put(`/reviews/1`)
      .set("Authorization", `Bearer ${token}`)
      .send({rating: 4, comment: "valid comment"});
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in delete (simulate DB error)", async () => {
    const user = await require("../models").User.create({
      username: "reviewdeleteerr",
      email: "reviewdeleteerr@mail.com",
      password: "password123",
    });
    const {signToken} = require("../helpers/jwt");
    const token = signToken({id: user.id, email: user.email});
    const spy = jest
      .spyOn(require("../models").Review, "destroy")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app)
      .delete(`/reviews/1`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});

describe("ReviewController more edge cases", () => {
  it("should return 400 if no fields provided for update", async () => {
    const user = await require("../models").User.create({
      username: "reviewupdateempty",
      email: "reviewupdateempty@mail.com",
      password: "password123"
    });
    const { signToken } = require("../helpers/jwt");
    const token = signToken({ id: user.id, email: user.email });
    const review = await require("../models").Review.create({
      userId: user.id,
      countryId: 1,
      rating: 3,
      comment: "valid comment"
    });
    const res = await request(app)
      .put(`/reviews/${review.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });
});

describe("ReviewController 100% coverage", () => {
  it("should return 400 if both rating and comment are undefined on update", async () => {
    const user = await require("../models").User.create({
      username: "reviewupdateundef",
      email: "reviewupdateundef@mail.com",
      password: "password123"
    });
    const { signToken } = require("../helpers/jwt");
    const token = signToken({ id: user.id, email: user.email });
    const review = await require("../models").Review.create({
      userId: user.id,
      countryId: 1,
      rating: 3,
      comment: "valid comment"
    });
    const res = await request(app)
      .put(`/reviews/${review.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: undefined, comment: undefined });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 400 if review id is NaN on delete", async () => {
    const user = await require("../models").User.create({
      username: "reviewdeleteNaN",
      email: "reviewdeleteNaN@mail.com",
      password: "password123"
    });
    const { signToken } = require("../helpers/jwt");
    const token = signToken({ id: user.id, email: user.email });
    const res = await request(app)
      .delete(`/reviews/NaN`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("message");
  });

  it("should return 404 if review not found on delete", async () => {
    const user = await require("../models").User.create({
      username: "reviewdelete404",
      email: "reviewdelete404@mail.com",
      password: "password123"
    });
    const { signToken } = require("../helpers/jwt");
    const token = signToken({ id: user.id, email: user.email });
    const res = await request(app)
      .delete(`/reviews/999999`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("message");
  });
});
