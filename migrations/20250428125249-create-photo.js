"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Weather", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      countryId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Countries",
          key: "id",
        },
        onUpdate: "cascade",
        onDelete: "cascade",
      },
      temperature: {
        type: Sequelize.FLOAT,
        validate: {
          min: 0,
        },
      },
      humidity: {
        type: Sequelize.FLOAT,
        validate: {
          min: 0,
        },
      },
      windSpeed: {
        type: Sequelize.FLOAT,
        validate: {
          min: 0,
        },
      },
      description: {
        type: Sequelize.STRING,
      },
      icon: {
        type: Sequelize.STRING,
      },
      updatedTime: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Weather");
  },
};
