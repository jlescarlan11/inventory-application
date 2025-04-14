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

const validateTrainer = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Trainer name is required")
    .escape()
    .custom(async (value) => {
      const existing = await db.getTrainerByName(value);
      if (existing) throw new Error("Trainer name already exists");
      return true;
    }),
];

const validateInventory = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name must be between 1-255 characters"),
  body("type1").isInt().withMessage("Invalid primary type selected"),
  body("type2")
    .optional({ checkFalsy: true })
    .isInt()
    .withMessage("Invalid secondary type selected"),
  body("pokemons")
    .isArray({ max: 6 })
    .withMessage("Maximum of 6 Pokémon allowed"),
];

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
    const allTypes = await db.getAllTypes();
    res.render("pokemons", {
      pokemons: pokemons,
      allTypes: allTypes,
      selectedTypes: [],
    });
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

exports.inventoriesCreatePokemonGet = async (req, res, next) => {
  try {
    const types = await db.getAllTypes();
    res.render("createPokemon", {
      types,
    });
  } catch (err) {
    next(err);
  }
};

exports.inventoriesCreatePokemonPost = [
  validateInventory,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const types = await db.getAllTypes();
      return res.render("createPokemon", {
        types,
        errors: errors.array(),
      });
    }
    try {
      const pokemon = await db.createPokemon(req.body);

      // res.redirect(`/pokemon/${pokemon.id}`);
      res.redirect("/pokemons");
    } catch (err) {
      next(err);
    }
  },
];

exports.inventoriesCreateTrainerGet = async (req, res, next) => {
  try {
    const pokemons = await db.getAllPokemons();
    res.render("createTrainer", { pokemons, selectedPokemons: [] });
  } catch (err) {
    next(err);
  }
};

exports.inventoriesCreateTrainerPost = [
  validateTrainer,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {
        const pokemons = await db.getAllPokemons();
        const selectedPokemons = req.body.pokemons
          ? [].concat(req.body.pokemons).map(String)
          : [];

        return res.render("createTrainer", {
          pokemons,
          errors: errors.array(),
          name: req.body.name,
          selectedPokemons,
        });
      } catch (err) {
        return next(err);
      }
    }

    try {
      // Create trainer
      const trainer = await db.createTrainer({ name: req.body.name });

      // Add selected Pokémon
      if (req.body.pokemons) {
        const pokemonIds = [].concat(req.body.pokemons).map(Number);
        await Promise.all(
          pokemonIds.map(async (pokemonId) => {
            await db.addPokemonToTrainer(trainer.id, pokemonId);
          })
        );
      }

      res.redirect("/trainers");
    } catch (err) {
      next(err);
    }
  },
];

exports.trainersList = async (req, res, next) => {
  try {
    const trainers = await db.getAllTrainersWithPokemon();
    res.render("trainers", { trainers });
  } catch (err) {
    next(err);
  }
};

exports.pokemonsSearchGet = async (req, res, next) => {
  try {
    console.log(req.query);
    let { name, types } = req.query;

    const pokemons = await db.getAllPokemons();
    const allTypes = await db.getAllTypes();

    const filteredPokemons = pokemons.filter((pokemon) => {
      let match = true;

      // Filter by name if provided
      if (name) {
        match =
          match &&
          pokemon.pokemon_name
            .toLowerCase()
            .includes(name.trim().toLowerCase());
      }

      // Filter by types only if types exists and is not empty.
      if (
        types &&
        ((Array.isArray(types) && types.length > 0) ||
          (!Array.isArray(types) && types !== ""))
      ) {
        // Convert types to an array if it's not already.
        if (!Array.isArray(types)) {
          types = [types];
        }

        // Use "some" to match if the Pokémon has at least one of the selected types.
        match =
          match &&
          types.some((type) => {
            console.log(
              String(pokemon.type1_id) === type ||
                String(pokemon.type2_id) === type
            );
            return (
              String(pokemon.type1_id) === type ||
              String(pokemon.type2_id) === type
            );
          });
      }

      return match;
    });

    res.render("search", {
      pokemons: filteredPokemons,
      allTypes: allTypes,
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
};
