const express = require("express");
const cocktailController = require("../controllers/cocktailController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(cocktailController.searchCocktails, cocktailController.getAllCocktails);
// .post(authController.protect, cocktailController.createCocktail);

router.route("/myCocktails").get(
  //  authController.protect,
  cocktailController.getMyCocktails
);

router.route("/random").get(cocktailController.randomCocktail);
router
  .route("/:id")
  .get(cocktailController.getCocktail)
  .patch(
    // authController.protect,
    // authController.restrictTo("admin"),
    cocktailController.updateCocktail
  )
  .delete(
    // authController.protect,
    // authController.restrictTo("admin"),
    cocktailController.deleteCocktail
  );

module.exports = router;
