const UserController = require("../controller/userController");
const CountryController = require("../controller/countryController");
const ReviewController = require("../controller/reviewController");
const guardOwner = require("../middlewares/guardOwner");
const errorHandler = require("../middlewares/errorHandler");
const authenticate = require("../middlewares/authentication");
const router = require("express").Router();

router.get("/", (req, res) => res.redirect("/countries"));

//login
router.post("/login", UserController.login); //sudah
router.post("/register", UserController.register); //sudah
router.post("/auth/google", UserController.googleLogin); //sudah

//getcountries
router.get("/countries", CountryController.getAllCountries); //sudah

//review
router.get("/countries/:id", CountryController.getById); //sudah
router.get("/countries/:id/summary", CountryController.generatesummary); //sudah
router.get("/countries/:id/unsplash", CountryController.unsplash); //sudah
router.get("/countries/:id/googleMaps", CountryController.googleMaps); //sudah

//authentication
router.use(authenticate);
router.get("/countries/:id/reviews", ReviewController.getByCountryId); //sudah
router.post("/countries/:id/reviews", ReviewController.create); //sudah
router.put("/reviews/:id", guardOwner, ReviewController.update); //sudah
router.delete("/reviews/:id", guardOwner, ReviewController.delete); //sudah

router.use(errorHandler);

module.exports = router;
