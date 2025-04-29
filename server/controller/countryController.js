const {Country} = require("../models/Review");

class CountryController {
  static async getAllCountries(req, res, next) {
    try {
      const {
        filter,
        sort,
        page = 1,
        limit = 10,
        search,
        region,
        name,
      } = req.query;
      const paramsQuerySQL = {where: {}};

      // search filter
      if (search) {
        paramsQuerySQL.where.name = {
          [Op.iLike]: `%${search}%`,
        };
      }

      // region filter
      if (region) {
        paramsQuerySQL.where.region = region;
      }

      // name filter
      if (name) {
        paramsQuerySQL.where.name = {
          [Op.iLike]: `%${name}%`,
        };
      }

      // filtering by category
      if (filter) {
        paramsQuerySQL.where.categoryId = filter;
      }

      // sorting
      if (sort) {
        const ordering = sort[0] === "-" ? "DESC" : "ASC";
        const columnName = ordering === "DESC" ? sort.slice(1) : sort;
        paramsQuerySQL.order = [[columnName, ordering]];
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
}

module.exports = CountryController;
