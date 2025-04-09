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

// async function addPokemon({ name, type1_id, type2_id }) {
//   const { rows } = await pool.query(
//     `
//     INSERT INTO pokemons (name, type1_id, type2_id)
//     VALUES($1, $2, $3)
//     RETURNING *
//     `,
//     [name, type1_id, type2_id]
//   );
// }

// async function addTrainer({ name }) {
//   const { rows } = await pool.query(
//     "INSERT INTO trainers (name) VALUES ($1) RETURNING *",
//     [name]
//   );
//   return rows[0];
// }

// async function addPokemonToInventory(trainerId, pokemonId) {
//   const client = await pool.connect();
//   try {
//     await client.query("BEGIN");

//     // Lock and check current count atomically
//     const countResult = await client.query(
//       "SELECT COUNT(*) FROM poke_inventories WHERE trainer_id = $1 FOR UPDATE",
//       [trainerId]
//     );
//     const count = parseInt(countResult.rows[0].count, 10);
//     if (count >= 6) {
//       throw new Error("Trainer already has 6 Pokémon");
//     }

//     // Insert into inventory
//     await client.query(
//       "INSERT INTO poke_inventories (trainer_id, pokemon_id) VALUES ($1, $2)",
//       [trainerId, pokemonId]
//     );

//     await client.query("COMMIT");
//   } catch (error) {
//     await client.query("ROLLBACK");
//     if (error.code === "23505") {
//       throw new Error("Pokémon already exists in inventory");
//     } else if (error.code === "23503") {
//       throw new Error("Invalid Trainer or Pokémon ID");
//     } else {
//       throw error; // Re-throw other errors
//     }
//   } finally {
//     client.release();
//   }
// }
