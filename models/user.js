"use strict";

const {Model} = require("sequelize");
const {hashPassword} = require("../helpers/bcrypt");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Favorite, {foreignKey: "UserId"});
      User.hasMany(models.Review, {foreignKey: "UserId"});
    }
  }
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Username is required",
          },
          notEmpty: {
            msg: "Username is required",
          },
          len: {
            args: [1],
            msg: "Username is required",
          },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already in use",
        },
        validate: {
          notNull: {
            msg: "Email is required",
          },
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Email format invalid",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          eitherPasswordOrGoogleId() {
            if (!this.password && !this.google_id) {
              throw new Error("Either password or Google ID must be provided");
            }
          },
        },
      },
      google_id: {
        type: DataTypes.STRING,
        unique: {
          msg: "Google account already linked to another user",
        },
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "manual",
      },
    },
    {
      sequelize,
      modelName: "User",
      hooks: {
        beforeValidate(user) {
          if (!user.password && !user.google_id) {
            throw new Error("Either password or Google ID must be provided");
          }
        },
      },
      timestamps: true,
    }
  );
  User.beforeCreate((user) => {
    if (user.password && user.password !== "") {
      user.password = hashPassword(user.password);
    }
  });

  User.beforeUpdate((user) => {
    if (user.changed("password") && user.password) {
      user.password = hashPassword(user.password);
    }
  });

  return User;
};
