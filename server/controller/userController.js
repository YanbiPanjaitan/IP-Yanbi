const {comparePassword} = require("../helpers/bcrypt");
const {signToken} = require("../helpers/jwt");
const {User} = require("../models");
const {OAuth2Client} = require("google-auth-library");

class UserController {
  static async register(req, res, next) {
    try {
      let {username, email, password} = req.body;
      let newUser = await User.create({
        username,
        email,
        password,
      });

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      let {email, password} = req.body;
      if (!email) {
        throw {name: "BadRequest", message: "Email is required"};
      }
      if (!password) {
        throw {name: "BadRequest", message: "Password is required"};
      }
      let user = await User.findOne({where: {email}});
      if (!user) {
        throw {name: "Unauthorized", message: "Invalid email/password"};
      }
      let isValidPassword = comparePassword(password, user.password);
      if (!isValidPassword) {
        throw {name: "Unauthorized", message: "Invalid email/password"};
      }
      let access_token = signToken({id: user.id, email: user.email});
      res.status(200).json({access_token, email: user.email}); // Sertakan email dalam respons
    } catch (error) {
      next(error);
    }
  }

  static async googleLogin(req, res, next) {
    const client = new OAuth2Client();
    const {googleToken} = req.body;

    try {
      if (!googleToken) {
        throw {name: "BadRequest", message: "Google token is required"};
      }

      const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const username = payload.email.split("@")[0];

      let user = await User.findOne({where: {email: payload.email}});

      if (!user) {
        user = await User.create({
          email: payload.email,
          username,
          password: Math.random().toString(36).slice(-8),
        });
      }

      const token = signToken({
        id: user.id,
        email: user.email,
        username: user.username,
      });
      res.status(200).json({access_token: token});
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
