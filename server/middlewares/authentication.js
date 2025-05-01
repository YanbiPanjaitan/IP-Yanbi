const {verifyToken} = require("../helpers/jwt");
const {User} = require("../models");

// Add detailed logging to debug token issues.
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.warn("No token provided in Authorization header"); // Log missing token
    return next({statusCode: 401, message: "Unauthorized"});
  }
  try {
    console.log("Token received:", token); // Log received token
    const data = verifyToken(token);
    console.log("Decoded token data:", data); // Log decoded token data

    let user = await User.findByPk(data.id);
    if (!user) {
      console.warn("User not found for token data:", data); // Log missing user
      return next({statusCode: 401, message: "Unauthorized"});
    }
    req.user = {id: user.id, email: user.email};
    next();
  } catch (error) {
    console.error("Error verifying token:", error); // Log token verification error
    next(error);
  }
};

module.exports = authenticate;
