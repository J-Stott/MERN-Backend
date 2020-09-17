const express = require("express");
const placesController = require("../controllers/places-controller");
const { check } = require("express-validator");

const router = express.Router();

router.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  placesController.addPlace
);

router.get("/:placeId", placesController.getPlaceById);
router.patch(
  "/:placeId",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlaceById
);
router.delete("/:placeId", placesController.deletePlaceById);
router.get("/user/:userId", placesController.getPlacesByUserId);

module.exports = router;
