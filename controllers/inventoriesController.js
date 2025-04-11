const db = require("../db/queries");
const { body, validationResult } = require("express-validator");

// const messageTrainerErr = "must be between 1 and 50 characters.";
// const maxPokemon = 6;

// const validateTrainer = [
//   body("trainerName")
//     .trim()
//     .isLength({ min: 1, max: 50 })
//     .withMessage(`Trainer name ${messageTrainerErr}`),
//   body("pokemonIds")
//     .isArray({ max: maxPokemon })
//     .withMessage(`Maximum ${maxPokemon} Pokémon allowed`),
// ];

navItems = [
  { name: "Home", href: "/" },
  { name: "Pokemons", href: "/pokemon" },
  { name: "Trainers", href: "/trainers" },
];

exports.inventoriesSummaryGet = async (req, res, next) => {
  res.render("index", { navItems });
};

exports.inventoriesTypesListGet = async (req, res, next) => {
  try {
    const types = await db.getAllTypes();
    res.render("types", { types: types });
  } catch (err) {
    next(err);
  }
};

exports.inventoriesPokemonsGet = async (req, res, next) => {
  try {
    const pokemons = await db.getAllPokemons();
    res.render("pokemons", { pokemons: pokemons });
  } catch (err) {
    next(err);
  }
};

exports.inventoriesTrainersGet = async (req, res, next) => {
  try {
    const trainers = await db.getAllTrainers();
    res.render("trainers", { trainers: trainers });
  } catch (err) {
    next(err);
  }
};

// exports.inventoriesPokemonsGet = async (req, res, next) => {
//   try {
//     const types = await db.getAllTypes();
//     res.render("createPokemon", {
//       types,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.inventoriesPokemonsPost = [
//   body("name")
//     .trim()
//     .isLength({ min: 1, max: 255 })
//     .withMessage("Name must be between 1-255 characters"),
//   body("type1").isInt().withMessage("Invalid primary type selected"),
//   body("type2")
//     .optional({ checkFalsy: true })
//     .isInt()
//     .withMessage("Invalid secondary type selected"),

//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const types = await db.getAllTypes();
//       return res.render("createPokemon", {
//         types,
//         errors: errors.array(),
//         name: req.body.name,
//         type1: req.body.type1,
//         type2: req.body.type2,
//         csrfToken: req.csrfToken(),
//       });
//     }

//     try {
//       await db.createPokemon({
//         name: req.body.name,
//         type1: req.body.type1,
//         type2: req.body.type2 || null,
//       });
//       res.redirect("/pokemons");
//     } catch (err) {
//       res.status(500).render("createPokemon", {
//         types: await db.getAllTypes(),
//         error: "Error creating Pokémon",
//         name: req.body.name,
//         type1: req.body.type1,
//         type2: req.body.type2,
//         csrfToken: req.csrfToken(),
//       });
//     }
//   },
// ];

// // Transform database fields to client-friendly format
// const transformTrainer = (dbTrainer) => ({
//   id: dbTrainer.trainer_id,
//   name: dbTrainer.trainer_name,
//   pokemons: dbTrainer.pokemons.map((p) => ({
//     id: p.pokemon_id,
//     name: p.pokemon_name,
//     types: [p.type1, p.type2].filter(Boolean),
//   })),
// });

// exports.trainersListGet = async (req, res, next) => {
//   try {
//     const dbTrainers = await db.getAllTrainersWithPokemon();
//     const trainers = dbTrainers.map(transformTrainer);
//     res.render("trainers", {
//       title: "Pokémon Trainers",
//       trainers,
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.trainersCreateGet = async (req, res, next) => {
//   try {
//     const pokemons = await db.getAllPokemon();
//     res.render("trainers/form", { pokemons });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.trainersCreatePost = [
//   validateTrainer,
//   async (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       try {
//         const pokemons = await db.getAllPokemon();
//         return res.status(400).render("trainers/form", {
//           errors: errors.array(),
//           pokemons,
//           trainerName: req.body.trainerName,
//           selectedPokemon: req.body.pokemonIds,
//         });
//       } catch (err) {
//         next(err);
//       }
//     }

//     try {
//       await db.addTrainerWithPokemon({
//         name: req.body.trainerName,
//         pokemonIds: req.body.pokemonIds,
//       });
//       res.redirect("/trainers");
//     } catch (err) {
//       res.status(500).render("trainers/form", {
//         error: "Failed to create trainer. Please try again.",
//         trainerName: req.body.trainerName,
//         selectedPokemon: req.body.pokemonIds,
//       });
//     }
//   },
// ];

// exports.trainersViewGet = async (req, res, next) => {
//   try {
//     const dbTrainer = await db.getTrainerWithPokemon(req.params.id);
//     if (!dbTrainer) {
//       return res.status(404).render("error", { message: "Trainer not found" });
//     }
//     res.render("trainers/view", {
//       trainer: transformTrainer(dbTrainer),
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// exports.trainersSearchGet = async (req, res, next) => {
//   try {
//     const { trainerName, pokemonName } = req.query;
//     const dbTrainers = await db.getAllTrainersWithPokemon();
//     const trainers = dbTrainers.map(transformTrainer);

//     const filteredTrainers = trainers.filter((trainer) => {
//       let match = true;

//       if (trainerName) {
//         match =
//           match &&
//           trainer.name.toLowerCase().includes(trainerName.trim().toLowerCase());
//       }

//       if (pokemonName) {
//         match =
//           match &&
//           trainer.pokemons.some((p) =>
//             p.name.toLowerCase().includes(pokemonName.trim().toLowerCase())
//           );
//       }

//       return match;
//     });

//     res.render("trainers/search", {
//       trainers: filteredTrainers,
//       query: req.query,
//     });
//   } catch (err) {
//     next(err);
//   }
// };
