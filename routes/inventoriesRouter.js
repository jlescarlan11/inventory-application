const { Router } = require("express");
const inventoriesRouter = Router();
const inventoriesController = require("../controllers/inventoriesController");

inventoriesRouter.get("/", inventoriesController.inventoriesListGet);

module.exports = inventoriesRouter;
