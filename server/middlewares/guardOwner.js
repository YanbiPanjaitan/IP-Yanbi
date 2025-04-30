const {Review} = require("../models");

const guardOwner = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return next({statusCode: 404, message: "Review not found"});
    }

    if (review.userId !== req.user.id) {
      return next({statusCode: 403, message: "Forbidden"});
    }

    req.review = review;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = guardOwner;
