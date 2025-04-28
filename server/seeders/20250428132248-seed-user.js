"use strict";

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
    const usersDataPath = path.join(__dirname, "../data/users.json");
    const usersData = JSON.parse(fs.readFileSync(usersDataPath, "utf8"));

    const users = usersData.map((user) => {
      const hashedPassword = user.google_id
        ? null
        : hashPassword(user.password || "");

      return {
        username: user.username,
        email: user.email,
        password: hashedPassword,
        google_id: user.google_id || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete("Users", null, {});
  },
};
