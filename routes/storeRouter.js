const express = require("express");
const storeRouter = express.Router();

// local modules
const homesControllers = require("../controllers/storeControllers");

storeRouter.get("/", homesControllers.getIndex);
storeRouter.get("/home", homesControllers.getHomes);
storeRouter.get("/booking", homesControllers.getBookings);
storeRouter.get("/favourites", homesControllers.getfavourite);

storeRouter.get("/home/:id", homesControllers.getHomeDetail);
storeRouter.post("/favourites", homesControllers.postAddToFavourite);
storeRouter.post(
  "/favourites/delete/:id",
  homesControllers.postRemoveFromFavourite
);
module.exports = storeRouter;
