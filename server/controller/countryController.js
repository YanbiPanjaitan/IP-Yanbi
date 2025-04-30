const {Country} = require("../models");
const {Op} = require("sequelize");
const {generateContent} = require("../helpers/gemini");
// const {GoogleMapsAPI, unsplashAPI} = require("../he");
class CountryController {
  static async getAllCountries(req, res, next) {
    try {
      const {filter, page = 1, limit = 20, search, name} = req.query;
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

      // 1. Ambil data negara
      const country = await Country.findByPk(countryId);
      if (!country) {
        throw {
          name: "NotFound",
          message: `Country with id ${countryId} not found`,
        };
      }

      // 2. Ambil semua review terkait country tersebut
      const reviews = await Review.findAll({
        where: {countryId},
        attributes: ["content"], // asumsikan field isi review bernama `content`
      });

      if (reviews.length === 0) {
        return res.status(200).json({
          country: country.name,
          summary: `Belum ada review untuk ${country.name}.`,
        });
      }

      // 3. Gabungkan semua review jadi 1 teks panjang
      const allReviewsText = reviews.map((r) => r.content).join(" ");

      // 4. Buat prompt untuk AI
      const prompt = `Buat ringkasan berdasarkan ulasan-ulasan berikut tentang negara ${country.name}:\n${allReviewsText}`;

      // 5. Kirim ke AI (misal: Gemini atau OpenAI)
      const summary = await generateContent(prompt); // pastikan generateContent mengembalikan string

      res.status(200).json({
        country: country.name,
        summary,
      });
    } catch (error) {
      next(error);
    }
  }

  // static async generatesummary(req, res, next) {
  //   try {
  //     const countryId = req.params.id;
  //     const country = await Country.findByPk(countryId);
  //     if (!country) {
  //       throw {
  //         name: "NotFound",
  //         message: `Country with id ${countryId} not found`,
  //       };
  //     }

  //     const prompt = `Generate a summary for the country ${country.name}, including its capital (${country.capital}), region (${country.region}), and population (${country.population}).`;
  //     const summary = await generateContent(prompt);

  //     res.status(200).json({
  //       country: country.name,
  //       summary,
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
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
      const countryId = req.params.id;
      const country = await Country.findByPk(countryId);
      if (!country) {
        throw {
          name: "NotFound",
          message: `Country with id ${countryId} not found`,
        };
      }

      const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${country.name}&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();

      res.status(200).json({
        country: country.name,
        location: data.results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CountryController;
