"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Review.belongsTo(models.User, {foreignKey: "userId"});
      Review.belongsTo(models.Country, {foreignKey: "countryId"});
    }
  }
  Review.init(
    {
      userId: DataTypes.INTEGER,
      countryId: DataTypes.INTEGER,
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
          notNull: {msg: "Rating is required"},
          notEmpty: {msg: "Rating is required"},
          min: {args: [1], msg: "Rating must be at least 1"},
          max: {args: [5], msg: "Rating must be at most 5"},
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notNull: {msg: "Comment is required"},
          notEmpty: {msg: "Comment cannot be empty"},
          len: {args: [5], msg: "Comment must be at least 5 characters long"},
        },
      },
    },
    {
      sequelize,
      modelName: "Review",
      timestamps: true,
    }
  );
  return Review;
};
