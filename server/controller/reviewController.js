const {Review, Country, User} = require("../models");

class ReviewController {
  static async getByCountryId(req, res, next) {
    try {
      const countryId = req.params.id;
      const userId = req.user?.id; // Optional chaining untuk menghindari error jika req.user undefined

      console.log(`Fetching reviews for countryId: ${countryId}`); // Log request details tanpa userId

      const reviews = await Review.findAll({
        where: {
          countryId: countryId,
        },
        include: [
          {
            model: User,
            attributes: ["username", "email"], // Include username and email fields
          },
        ],
      });

      if (reviews.length === 0) {
        console.info(`No reviews found for countryId: ${countryId}`); // Log info jika tidak ada review
        return res.status(200).json([]); // Kembalikan array kosong dengan status 200
      }

      res.status(200).json(reviews);
    } catch (error) {
      console.error(
        `Error fetching reviews for countryId: ${req.params.id}`,
        error
      ); // Log detailed error
      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const {rating, comment} = req.body;

      if (!rating || !comment) {
        throw {name: "BadRequest", message: "All fields are required"};
      }

      const review = await Review.create({
        userId: req.user.id,
        countryId: req.params.id,
        rating,
        comment,
      });

      const createdReview = await Review.findByPk(review.id, {
        include: [{model: User, attributes: ["username", "email"]}],
      });

      res.status(201).json(createdReview);
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const {id} = req.params;
      const {rating, comment} = req.body;

      if (!rating || !comment) {
        throw {name: "BadRequest", message: "All fields are required"};
      }

      if (rating === undefined && comment === undefined) {
        throw {
          name: "BadRequest",
          message: "At least one field must be provided for update",
        };
      }

      const [count, updatedReviews] = await Review.update(
        {rating, comment},
        {where: {id}, returning: true}
      );

      if (count === 0) {
        throw {name: "NotFound", message: "Review not found"};
      }

      const updatedReview = await Review.findByPk(id, {
        include: [{model: User, attributes: ["username", "email"]}],
      });

      res.status(200).json(updatedReview);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const {id} = req.params;

      if (!id || isNaN(id)) {
        console.error("Invalid review ID provided:", id);
        return res.status(400).json({message: "Invalid review ID"});
      }

      console.log("Attempting to delete review with ID:", id);
      console.log("Delete request received for reviewId:", id); // Log tambahan untuk memeriksa permintaan DELETE

      const deleted = await Review.destroy({where: {id}});

      if (!deleted) {
        throw {name: "NotFound", message: "Review not found"};
      }

      res.status(200).json({message: "Review deleted successfully"});
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
