const { Router } = require("express");
const inventoriesRouter = Router();
const inventoriesController = require("../controllers/inventoriesController");

inventoriesRouter.get("/", inventoriesController.inventoriesSummaryGet);
inventoriesRouter.get("/types", inventoriesController.inventoriesTypesListGet);
inventoriesRouter.get(
  "/pokemons",
  inventoriesController.inventoriesPokemonsGet
);
// routes/inventories.js
inventoriesRouter.get("/trainers", inventoriesController.trainersList);

inventoriesRouter.get(
  "/pokemons/create",
  inventoriesController.inventoriesCreatePokemonGet
);
inventoriesRouter.post(
  "/pokemons/create",
  inventoriesController.inventoriesCreatePokemonPost
);

inventoriesRouter.get(
  "/trainers/create",
  inventoriesController.inventoriesCreateTrainerGet
);

inventoriesRouter.post(
  "/trainers/create",
  inventoriesController.inventoriesCreateTrainerPost
);

// inventoriesRouter.get("/pokemons", inventoriesController.inventoriesPokemonGet);

// inventoriesRouter.get(
//   "/pokemons/create",
//   inventoriesController.inventoriesPokemonsGet
// );
// inventoriesRouter.post(
//   "/pokemons/create",
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
