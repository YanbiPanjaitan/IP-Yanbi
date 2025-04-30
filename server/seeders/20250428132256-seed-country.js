"use strict";

const axios = require("axios");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const response = await axios.get("https://restcountries.com/v3.1/all");

    const sortedCountries = response.data.sort((a, b) => {
      const nameA = a.name.common.toLowerCase();
      const nameB = b.name.common.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const countries = sortedCountries.map((country) => {
      const [latitude, longitude] = country.latlng || [null, null];

      return {
        name: country.name.common || "Unknown Country",
        capital:
          Array.isArray(country.capital) && country.capital.length > 0
            ? country.capital[0]
            : "Unknown",
        region: country.region || "Unknown",
        population: country.population || 0,
        flagUrl:
          country.flags?.svg ||
          country.flags?.png ||
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/No_flag.svg/225px-No_flag.svg.png",
        latitude: latitude || null,
        longitude: longitude || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await queryInterface.bulkInsert("Countries", countries, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Countries", null, {
      truncate: true,
      cascade: true,
      restartIdentity: true,
    });
  },
};
