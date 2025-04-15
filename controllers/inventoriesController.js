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

const validateTrainerUpdate = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Trainer name is required")
    .escape(),
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
];

navItems = [
  { name: "Home", href: "/" },
  { name: "Pokemons", href: "/pokemons" },
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

exports.trainersSearchGet = async (req, res, next) => {
  try {
    const trainers = await db.getAllTrainersWithPokemon();

    let { name } = req.query;

    const filteredTrainers = trainers.filter((trainer) => {
      let match = true;

      // Filter by name if provided
      if (name) {
        match =
          match &&
          trainer.name.toLowerCase().includes(name.trim().toLowerCase());
      }

      return match;
    });
    res.render("searchTrainer", {
      trainers: filteredTrainers,
      query: req.query,
    });
  } catch (err) {
    next(err);
  }
};

exports.trainersDeletePost = async (req, res, next) => {
  try {
    await db.deleteTrainer(req.params.id);
    res.redirect("/trainers");
  } catch (err) {
    next(err);
  }
};

exports.trainersUpdatePost = [
  validateTrainer,
  async (req, res, next) => {
    const { id } = req.params;
    const { name } = req.body;
    const pokemons = req.body.pokemons || []; // Array of selected Pokémon IDs

    // Validate required fields
    if (!name || name.trim() === "") {
      req.flash("error", "Trainer name is required");
      return res.redirect(`/trainers/${id}/update`);
    }

    await db.updateTrainer(id, { name: name.trim() }, pokemons);

    res.redirect(`/trainers`);
  },
];

exports.trainersUpdateGet = async (req, res, next) => {
  try {
    const trainer = await db.getTrainerById(req.params.id);
    const pokemons = await db.getAllPokemons();
    const trainerPokemons = await db.getTrainerPokemon(req.params.id);
    // Extract Pokémon IDs from the join table results

    const selectedPokemons = trainerPokemons.map((p) => p.id);

    res.render("updateTrainer", {
      trainer: trainer,
      pokemons,
      selectedPokemons: selectedPokemons,
    });
  } catch (err) {
    next(err);
  }
};

exports.pokemonsDeletePost = async (req, res, next) => {
  try {
    await db.deletePokemon(req.params.id);
    res.redirect("/pokemons");
  } catch (err) {
    next(err);
  }
};

exports.pokemonsUpdateGet = async (req, res, next) => {
  try {
    const pokemon = await db.getPokemonById(req.params.id);

    const types = await db.getAllTypes();
    const pokemonTypes = await db.getPokemonTypes(pokemon);

    const selectedTypes = pokemonTypes.map((t) => t.id);
    res.render("updatePokemon", {
      pokemon,
      types,
      selectedTypes,
    });
  } catch (err) {
    next(err);
  }
};

exports.pokemonsUpdatePost = [
  validateInventory,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      try {
        // Parallelize database calls for better performance
        const [pokemon, types, pokemonTypes] = await Promise.all([
          db.getPokemonById(req.params.id),
          db.getAllTypes(),
          db.getPokemonTypes(req.params.id),
        ]);

        const selectedTypes = pokemonTypes.map((t) => t.id);
        // Merge existing data with user input to preserve valid changes
        const mergedPokemon = { ...pokemon, ...req.body };

        return res.render("updatePokemon", {
          pokemon: mergedPokemon,
          types,
          selectedTypes,
          errors: errors.array(),
        });
      } catch (err) {
        next(err);
      }
    }

    try {
      const { id } = req.params;

      // Extract and sanitize data from request body
      const { name, type1, type2 } = req.body;

      // Update pokemon and associated types
      await db.updatePokemon(id, name, type1, type2);

      res.redirect(`/pokemons`);
    } catch (err) {
      next(err);
    }
  },
];
