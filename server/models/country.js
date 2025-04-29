"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Country.hasMany(models.Review, {foreignKey: "countryId"});
    }
  }
  Country.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Country name is required",
          },
          notEmpty: {
            msg: "Country name is required",
          },
        },
      },
      capital: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Capital is required",
          },
          notEmpty: {
            msg: "Capital is required",
          },
        },
      },
      region: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Region is required",
          },
          notEmpty: {
            msg: "Region is required",
          },
        },
      },
      population: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Population is required",
          },
          isInt: {
            msg: "Population must be a number",
          },
          min: {
            args: [0],
            msg: "Population cannot be negative",
          },
        },
      },
      flagUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Flag URL is required",
          },
          notEmpty: {
            msg: "Flag URL is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Country",
      timestamps: true,
    }
  );
  return Country;
};
