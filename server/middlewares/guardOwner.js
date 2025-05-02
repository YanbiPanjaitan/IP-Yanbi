const {Review} = require("../models");

const guardOwner = async (req, res, next) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findByPk(reviewId);

    if (!review) {
      return next({name: "NotFound", message: "Review not found"});
    }

    if (review.userId !== req.user.id) {
      return next({
        name: "Forbidden",
        message: "You are not allowed to access this resource",
      });
    }

    req.review = review;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = guardOwner;
