const { Router } = require("express");
const inventoriesRouter = Router();
const inventoriesController = require("../controllers/inventoriesController");

inventoriesRouter.get("/", inventoriesController.inventoriesSummaryGet);
inventoriesRouter.get("/types", inventoriesController.inventoriesTypesListGet);
inventoriesRouter.get(
  "/pokemons",
  inventoriesController.inventoriesPokemonsGet
);
// inventoriesRouter.get("/pokemons", inventoriesController.inventoriesPokemonGet);

// inventoriesRouter.get(
//   "/createPokemon",
//   inventoriesController.inventoriesPokemonsGet
// );
// inventoriesRouter.post(
//   "/createPokemon",
//   inventoriesController.inventoriesPokemonsPost
// );

// inventoriesRouter.get(
//   "/createTrainer",
//   inventoriesController.inventoriesTrainersGet
// );
// inventoriesRouter.post(
//   "/createTrainer",
//   inventoriesController.inventoriesTrainersPost
// );

// inventoriesRouter.Get("/createType", inventoriesController.inventoriesTypesGet);
// inventoriesRouter.post(
//   "/createType",
//   inventoriesController.inventoriesTypesPost
// );

module.exports = inventoriesRouter;
