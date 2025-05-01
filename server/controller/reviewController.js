const {Review, Country} = require("../models");

class ReviewController {
  static async getByCountryId(req, res, next) {
    try {
      const countryId = req.params.id;
      const userId = req.user.id;

      const reviews = await Review.findAll({
        where: {
          countryId: countryId,
        },
      });

      if (reviews.length === 0) {
        return res
          .status(404)
          .json({message: "No reviews found for this country"});
      }

      res.status(200).json(reviews);
    } catch (error) {
      console.log(error, "<<<<");

      next(error);
    }
  }
  static async create(req, res, next) {
    try {
      const {rating, comment} = req.body;

      console.log("Received review data:", {rating, comment});

      if (!rating || !comment) {
        throw {name: "BadRequest", message: "All fields are required"};
      }

      const review = await Review.create({
        userId: req.user.id,
        countryId: req.params.id,
        rating,
        comment,
      });

      res.status(201).json(review);
    } catch (error) {
      console.error("Error in create review:", error);
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const {id} = req.params;
      const {title, content, rating} = req.body;

      if (
        title === undefined &&
        content === undefined &&
        rating === undefined
      ) {
        throw {
          name: "BadRequest",
          message: "At least one field must be provided for update",
        };
      }

      const [count, updatedReviews] = await Review.update(
        {title, content, rating},
        {where: {id}, returning: true}
      );

      if (count === 0) {
        throw {name: "NotFound", message: "Review not found"};
      }

      res.status(200).json(updatedReviews[0]);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const {id} = req.params;
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
