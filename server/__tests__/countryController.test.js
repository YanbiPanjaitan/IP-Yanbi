const request = require("supertest");
const app = require("../app");
const {sequelize, Country} = require("../models");
jest.mock("axios");
const axios = require("axios");

beforeAll(async () => {
  await Country.create({
    name: "Indonesia",
    region: "Asia",
    capital: "Jakarta",
    population: 273523621,
    flagUrl: "https://example.com/flag.png",
    latitude: -6.2,
    longitude: 106.8,
  });
});

afterAll(async () => {
  await Country.destroy({
    where: {},
    truncate: true,
    cascade: true,
    restartIdentity: true,
  });
  await sequelize.close();
});

describe("CountryController", () => {
  describe("GET /countries", () => {
    it("should return a list of countries", async () => {
      const response = await request(app).get("/countries").expect(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: "Indonesia",
            region: "Asia",
          }),
        ])
      );
    });
  });

  describe("GET /countries/:id", () => {
    it("should return a country by ID", async () => {
      const response = await request(app).get("/countries/1").expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          name: "Indonesia",
          region: "Asia",
        })
      );
    });

    it("should return 404 if country not found", async () => {
      await request(app).get("/countries/999").expect(404);
    });
  });

  describe("GET /countries/:id/summary", () => {
    it("should return a summary for a country", async () => {
      const response = await request(app)
        .get("/countries/1/summary")
        .expect(200);
      expect(response.body).toHaveProperty("summary");
    });

    it("should return default summary if no reviews", async () => {
      // Buat country baru tanpa review
      const country = await Country.create({
        name: "NoReviewLand",
        region: "Nowhere",
        capital: "None",
        population: 1,
        flagUrl: "none.png",
        latitude: 0,
        longitude: 0,
      });
      const response = await request(app)
        .get(`/countries/${country.id}/summary`)
        .expect(200);
      expect(response.body.summary).toMatch(/Belum ada review/);
    });

    it("should return AI summary if reviews exist", async () => {
      // Buat user dan country
      const user = await require("../models").User.create({
        username: "reviewer",
        email: "reviewer@mail.com",
        password: "password123",
      });
      const country = await Country.create({
        name: "Ailand",
        region: "Asia",
        capital: "Aicity",
        population: 100,
        flagUrl: "ai.png",
        latitude: 1,
        longitude: 1,
      });
      await require("../models").Review.create({
        countryId: country.id,
        comment: "Negara yang indah!",
        rating: 5,
        userId: user.id,
      });
      jest
        .spyOn(require("../helpers/gemini"), "generateContent")
        .mockResolvedValueOnce(
          "Ringkasan: Ulasan-ulasan tersebut memberikan kesan bahwa negara Ailand adalah negara yang indah."
        );
      const response = await request(app)
        .get(`/countries/${country.id}/summary`)
        .expect(200);
      expect(response.body.summary).toContain("Ailand");
      expect(response.body.summary.toLowerCase()).toContain("indah");
    });
  });

  describe("GET /countries/:id/unsplash", () => {
    it("should return photos from Unsplash", async () => {
      const response = await request(app)
        .get("/countries/1/unsplash")
        .expect(200);
      expect(response.body).toHaveProperty("photos");
    });

    it("should return 404 if country not found in /countries/:id/unsplash", async () => {
      jest
        .spyOn(require("../models").Country, "findByPk")
        .mockResolvedValueOnce(null);
      const res = await request(app).get("/countries/999/unsplash");
      expect(res.status).toBe(404);
    });
  });

  describe("GET /countries/:id/googleMaps", () => {
    it("should return Google Maps data", async () => {
      jest.spyOn(require("axios"), "get").mockResolvedValueOnce({
        data: {results: [{geometry: {location: {lat: 1, lng: 2}}}]},
      });
      const response = await request(app)
        .get("/countries/1/googleMaps")
        .expect(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          coordinates: expect.objectContaining({
            lat: expect.any(Number),
            lng: expect.any(Number),
          }),
          country: "Indonesia",
          mapUrl: expect.any(String),
        })
      );
    });
  });
});

describe("CountryController error cases", () => {
  it("should return 404 for summary if country not found", async () => {
    const res = await request(app).get("/countries/9999/summary");
    expect(res.status).toBe(404);
  });

  it("should handle external API error in /unsplash", async () => {
    jest
      .spyOn(require("axios"), "get")
      .mockRejectedValueOnce(new Error("Unsplash error"));
    const res = await request(app).get("/countries/1/unsplash");
    expect(res.status).toBe(500);
  });

  it("should handle external API error in /unsplash", async () => {
    axios.get.mockRejectedValueOnce(new Error("Unsplash error"));
    const res = await request(app).get("/countries/1/googleMaps");
    expect(res.status).toBe(500);
  });
});

describe("CountryController additional error cases", () => {
  it("should handle error in getAllCountries (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Country, "findAndCountAll")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get("/countries");
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in getById (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Country, "findByPk")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get("/countries/1");
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in generatesummary (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Country, "findByPk")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get("/countries/1/summary");
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in unsplash (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Country, "findByPk")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get("/countries/1/unsplash");
    expect(res.status).toBe(500);
    spy.mockRestore();
  });

  it("should handle error in googleMaps (simulate DB error)", async () => {
    const spy = jest
      .spyOn(require("../models").Country, "findByPk")
      .mockImplementationOnce(() => {
        throw new Error("DB error");
      });
    const res = await request(app).get("/countries/1/googleMaps");
    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});

describe("CountryController 100% coverage", () => {
  it("should filter countries by search", async () => {
    const res = await request(app).get("/countries?search=Indo");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("should filter countries by region", async () => {
    const res = await request(app).get("/countries?filter=Asia");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("should return 404 if country not found in summary", async () => {
    const res = await request(app).get("/countries/999999/summary");
    expect(res.status).toBe(404);
  });
  it("should return 404 if country not found in unsplash", async () => {
    jest
      .spyOn(require("../models").Country, "findByPk")
      .mockResolvedValueOnce(null);
    const res = await request(app).get("/countries/999999/unsplash");
    expect(res.status).toBe(404);
  });
});
