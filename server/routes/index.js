const UserController = require("../controller/userController");
const CountryController = require("../controller/countryController");
const ReviewController = require("../controller/reviewController");
const guardOwner = require("../middlewares/guardOwner");
const errorHandler = require("../middlewares/errorHandler");
const {authenticate} = require("../middlewares/authentication");
const router = require("express").Router();

router.get("/", (req, res) => res.redirect("/countries"));
//login
router.post("/login", UserController.login); //sudah
router.post("/auth/google", UserController.googleLogin); //sudah
router.post("/register", UserController.register); //sudah

//getcountries
router.get("/countries", CountryController.getAllCountries); //sudah

//review
router.get("/countries/:id", CountryController.getById); //sudah
router.get("/countries/:id/summary", CountryController.generatesummary);
router.get("/countries/:id/unsplash", CountryController.unsplash);
router.get("/countries/:id/googleMaps", CountryController.googleMaps);

//authentication
router.use(authenticate);
router.post("/countries/:id/reviews", guardOwner, ReviewController.create);
router.put("/reviews/:id", guardOwner, ReviewController.update);
router.delete("/reviews/:id", guardOwner, ReviewController.delete);

router.use(errorHandler);

module.exports = router;
