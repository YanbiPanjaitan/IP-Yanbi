const UserController = require("../Controllers/UserController");
const CountryController = require("../Controllers/CountryController");
const ReviewController = require("../Controllers/ReviewController");
const guardOwner = require("../middlewares/guardOwner");
const errorHandler = require("../middlewares/errorHandler");
const {authenticate} = require("../middlewares/authentication");
const router = require("express").Router();

router.get("/", (req, res) => res.redirect("/countries"));
//login
router.post("/login", UserController.login);
router.post("/auth/google", UserController.googleLogin);
router.post("/register", UserController.register);

//getcountries
router.get("/countries", CountryController.getAll);

//review
router.get("/countries/:id", CountryController.getById);
router.get("/countries/:id/summary", CountryController.summary);
router.get("/countries/:id/unsplash", CountryController.unsplash);
router.get("/countries/:id/googleMaps", CountryController.googleMaps);

//perlu authentication
router.use(authenticate);
router.post("/countries/:id/reviews", guardOwner, ReviewController.create);
router.put("/reviews/:id", guardOwner, ReviewController.update);
router.delete("/reviews/:id", guardOwner, ReviewController.delete);

router.use(errorHandler);

module.exports = router;
