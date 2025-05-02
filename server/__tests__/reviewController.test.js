const request = require("supertest");
const app = require("../app");
const {sequelize, User, Country, Review} = require("../models");
const {signToken} = require("../helpers/jwt");

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
        .send({rating: 4, comment: "Nice!"});
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("comment", "Nice!");
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
      const res = await request(app)
        .put(`/reviews/${review.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({rating: 3, comment: "Updated!"});
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("comment", "Updated!");
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
        .send({rating: 2, comment: "Not found"});
      expect(res.status).toBe(404);
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
