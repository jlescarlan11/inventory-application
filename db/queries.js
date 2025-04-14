const pool = require("./pool");

async function getPokeInventories() {
  const { rows } = await pool.query(`
        SELECT * 
            FROM poke_inventories pi 
            JOIN trainers t ON pi.trainer_id = t.id
            JOIN pokemons p ON pi.pokemon_id = p.id
            JOIN types t1 ON p.type1_id = t1.id
            JOIN types t2 ON p.type2_id = t2.id
    `);

  return rows.reduce((acc, row) => {
    const trainer = acc.find((t) => t.id === row.trainer_id) || {
      id: row.trainer_id,
      name: row.trainer_name,
      pokemons: [],
    };

    if (row.pokemon_id) {
      trainer.pokemons.push({
        id: row.pokemon_id,
        name: row.pokemon_name,
        types: [row.type1, row.type2].filter(Boolean),
      });
    }

    if (!acc.includes(trainer)) acc.push(trainer);
    return acc;
  }, []);
}

async function getAllTypes() {
  const { rows } = await pool.query("SELECT * FROM types ORDER BY name");
  return rows;
}

async function getAllPokemons() {
  const { rows } = await pool.query(`
        SELECT p.id, p.name AS pokemon_name, t1.name AS type1, t2.name AS type2
        FROM pokemons p
        LEFT JOIN types t1 ON p.type1_id = t1.id
        LEFT JOIN types t2 ON p.type2_id = t2.id
        ORDER BY p.name   
        `);

  return rows;
}

async function getAllTrainers() {
  const { rows } = await pool.query(`
    SELECT *
    FROM trainers
    ORDER BY created_at DESC    
    `);
  return rows;
}

async function createPokemon({ name, type1, type2 }) {
  // Convert empty string values to null
  type1 = type1 === "" ? null : parseInt(type1, 10);
  type2 = type2 === "" ? null : parseInt(type2, 10);
  const { rows } = await pool.query(
    `INSERT INTO pokemons (name, type1_id, type2_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
    [name, type1, type2]
  );
  return rows[0];
}

async function createTrainer({ name }) {
  const { rows } = await pool.query(
    `INSERT INTO trainers (name)
         VALUES ($1)
         RETURNING *`,
    [name]
  );
  return rows[0];
}

async function addPokemonToTrainer(trainer_id, pokemon_id) {
  const { rows } = await pool.query(
    `INSERT INTO poke_inventories (trainer_id, pokemon_id)
         VALUES ($1, $2)
         RETURNING *`,
    [trainer_id, pokemon_id]
  );
  return rows[0];
}

async function getTrainerByName(name) {
  const { rows } = await pool.query("SELECT * FROM trainers WHERE name = $1", [
    name,
  ]);
  return rows[0];
}

async function getAllTrainersWithPokemon() {
  const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.created_at,
        p.id AS pokemon_id,
        p.name AS pokemon_name,
        pi.caught_at
      FROM trainers t
      LEFT JOIN poke_inventories pi ON t.id = pi.trainer_id
      LEFT JOIN pokemons p ON pi.pokemon_id = p.id
      LEFT JOIN types t1 ON p.type1_id = t1.id
      LEFT JOIN types t2 ON p.type2_id = t2.id
      GROUP BY t.id, p.id, pi.caught_at
      ORDER BY t.created_at DESC
    `);

  // Transform the results into nested objects
  return result.rows.reduce((acc, row) => {
    let trainer = acc.find((t) => t.id === row.id);
    if (!trainer) {
      trainer = {
        id: row.id,
        name: row.name,
        created_at: row.created_at,
        pokemons: [],
      };
      acc.push(trainer);
    }

    if (row.pokemon_id) {
      trainer.pokemons.push({
        id: row.pokemon_id,
        name: row.pokemon_name,
        caught_at: row.caught_at,
        types: row.types,
      });
    }
    return acc;
  }, []);
}

module.exports = {
  getPokeInventories,
  getAllTypes,
  getAllPokemons,
  getAllTrainers,
  createPokemon,
  createTrainer,
  addPokemonToTrainer,
  getTrainerByName,
  getAllTrainersWithPokemon,
};
