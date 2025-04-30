const {Country, Review} = require("../models");
const {Op} = require("sequelize");
const {generateContent} = require("../helpers/gemini");
const axios = require("axios");
class CountryController {
  static async getAllCountries(req, res, next) {
    try {
      const {filter, page = 1, limit = 20, search} = req.query;
      const paramsQuerySQL = {where: {}};

      // search filter
      if (search) {
        paramsQuerySQL.where.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // name filter
      if (filter) {
        paramsQuerySQL.where.region = {
          [Op.iLike]: `%${filter}%`,
        };
      }

      // pagination
      paramsQuerySQL.limit = parseInt(limit);
      paramsQuerySQL.offset = parseInt(limit) * (parseInt(page) - 1);

      const {count, rows} = await Country.findAndCountAll(paramsQuerySQL);

      res.status(200).json({
        page: +page,
        data: rows,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        dataPerPage: +limit,
      });
    } catch (error) {
      next(error);
    }
  }
  static async getById(req, res, next) {
    try {
      const countryId = req.params.id;
      const country = await Country.findByPk(countryId);
      if (!country) {
        throw {
          name: "NotFound",
          message: `Country with id ${countryId} not found`,
        };
      }
      res.status(200).json(country);
    } catch (error) {
      next(error);
    }
  }
  static async generatesummary(req, res, next) {
    try {
      const countryId = req.params.id;

      const country = await Country.findByPk(countryId);
      if (!country) {
        throw {
          name: "NotFound",
          message: `Country with id ${countryId} not found`,
        };
      }

      // 2.Mengambil review suatu negara
      const reviews = await Review.findAll({
        where: {countryId},
        attributes: ["comment"], // diasumsikan menjadi review
      });

      if (reviews.length === 0) {
        return res.status(200).json({
          country: country.name,
          summary: `Belum ada review untuk ${country.name}.`,
        });
      }

      // 3.Gabungkan semua reviews
      const allReviewsText = reviews.map((r) => r.content).join(" ");

      // 4. Prompt AI
      const prompt = `Buat ringkasan berdasarkan ulasan-ulasan berikut tentang negara ${country.name}:\n${allReviewsText}`;

      // 5. Mengitimkan prompt ke AI
      const summary = await generateContent(prompt);

      res.status(200).json({
        country: country.name,
        summary,
      });
    } catch (error) {
      next(error);
    }
  }
  static async unsplash(req, res, next) {
    try {
      const countryId = req.params.id;
      const country = await Country.findByPk(countryId);
      if (!country) {
        throw {
          name: "NotFound",
          message: `Country with id ${countryId} not found`,
        };
      }

      const UNSPLASH_API_KEY = process.env.UNSPLASH_API_KEY;
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${country.name}&client_id=${UNSPLASH_API_KEY}`
      );
      const data = await response.json();

      res.status(200).json({
        country: country.name,
        photos: data.results,
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleMaps(req, res, next) {
    try {
      const {id} = req.params;

      const country = await Country.findByPk(id);

      if (!country) {
        return res.status(404).json({error: "Country not found in database."});
      }

      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      console.log("Mencari koordinat untuk:", country.name);

      const geoResponse = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          country.name
        )}&key=${apiKey}`
      );
      console.log("GeoResponse:", JSON.stringify(geoResponse.data, null, 2));

      const location = geoResponse.data.results[0]?.geometry?.location;

      if (!location) {
        return res.status(404).json({error: "Coordinates not found."});
      }

      const {lat, lng} = location;git 

      res.status(200).json({
        country: country.name,
        coordinates: {lat, lng},
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CountryController;
