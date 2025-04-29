const {Recipe} = require("../models");

const guardOwner = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return next({statusCode: 404, message: "Recipe not found"});
    }
    if (recipe.UserId !== req.user.id) {
      return next({statusCode: 403, message: "Forbidden"});
    }
    req.recipe = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = guardOwner;
