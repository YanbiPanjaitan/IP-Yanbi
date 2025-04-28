"use strict";
const {Model} = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Map extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Map.belongsTo(models.Country, {foreignKey: "countryId"});
    }
  }
  Map.init(
    {
      countryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Countries",
          key: "id",
        },
        validate: {
          notNull: {
            msg: "Country ID is required",
          },
          notEmpty: {
            msg: "Country ID is required",
          },
        },
      },
      mapUrl: {
        type: DataTypes.STRING,
      },
      latitude: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: {
            msg: "Latitude must be a number",
          },
          min: {
            args: [-90],
            msg: "Latitude must be between -90 and 90",
          },
          max: {
            args: [90],
            msg: "Latitude must be between -90 and 90",
          },
        },
      },
      longitude: {
        type: DataTypes.FLOAT,
        validate: {
          isFloat: {
            msg: "Longitude must be a number",
          },
          min: {
            args: [-180],
            msg: "Longitude must be between -180 and 180",
          },
          max: {
            args: [180],
            msg: "Longitude must be between -180 and 180",
          },
        },
      },
      zoomLevel: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
        validate: {
          isInt: {
            msg: "Zoom level must be an integer",
          },
          min: {
            args: [1],
            msg: "Zoom level must be at least 1",
          },
          max: {
            args: [20],
            msg: "Zoom level cannot exceed 20",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Map",
      timestamps: true,
    }
  );
  return Map;
};
