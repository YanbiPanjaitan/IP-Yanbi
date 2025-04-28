"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Recommendation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recommendation.belongsTo(models.Favorite, {foreignKey: "favoriteId"});
    }
  }
  Recommendation.init(
    {
      favoriteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Favorite ID is required",
          },
        },
      },
      landmarkName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Landmark name is required",
          },
          notEmpty: {
            msg: "Landmark name is required",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
      },
      imageUrl: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Recommendation",
      timestamps: true,
    }
  );
  return Recommendation;
};
