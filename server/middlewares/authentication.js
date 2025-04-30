const {verifyToken} = require("../helpers/jwt");
const {User} = require("../models");

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return next({statusCode: 401, message: "Unauthorized"});
  }
  try {
    const data = verifyToken(token);
    let user = await User.findByPk(data.id);
    if (!user) {
      return next({statusCode: 401, message: "Unauthorized"});
    }
    req.user = {id: user.id, email: user.email};
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authenticate;
