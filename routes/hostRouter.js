const express = require("express");
const hostRouter = express.Router();

// local modules
const hostControllers = require("../controllers/hostControllers");

hostRouter.get("/add-home", hostControllers.getAddHome);
hostRouter.post("/host/add-home", hostControllers.postAddHome);
hostRouter.get("/host-home-list", hostControllers.getHostHomes);
hostRouter.get("/host/edit-home/:id", hostControllers.getEditHome);
hostRouter.post("/host/edit-home/", hostControllers.postEditHome);
hostRouter.post("/host/delete-home/:id", hostControllers.deleteHome);

module.exports = hostRouter;
