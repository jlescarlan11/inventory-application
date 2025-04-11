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
        SELECT p.name AS pokemon_name, t1.name AS type1, t2.name AS type2
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
  const { rows } = await pool.query(
    `INSERT INTO pokemons (name, type1_id, type2_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
    [name, type1, type2]
  );
  return rows[0];
}

module.exports = {
  getPokeInventories,
  getAllTypes,
  getAllPokemons,
  getAllTrainers,
  createPokemon,
};
