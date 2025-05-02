const {verifyToken} = require("../helpers/jwt");
const {User} = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      throw {name: "Unauthorized", message: "Unauthorized"};
    }
    const data = verifyToken(token);

    let user = await User.findByPk(data.id);
    if (!user) {
      throw {name: "Unauthorized", message: "Unauthorized"};
    }
    req.user = {id: user.id, email: user.email};
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
