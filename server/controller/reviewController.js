const {Review} = require("../models");

class ReviewController {
  static async create(req, res, next) {
    try {
      const {title, content, rating, userId, countryId} = req.body;

      if (!title || !content || rating === undefined || !userId || !countryId) {
        throw {name: "BadRequest", message: "All fields are required"};
      }

      const newReview = await Review.create({
        title,
        content,
        rating,
        userId,
        countryId,
      });

      res.status(201).json(newReview);
    } catch (error) {
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
