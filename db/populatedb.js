const { Client } = require("pg");
require("dotenv").config();

const SQL = `
CREATE TABLE IF NOT EXISTS types (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL UNIQUE
);

INSERT INTO types (name)
VALUES 
    ('Normal'),
    ('Fire'),
    ('Water'),
    ('Electric'),
    ('Grass'),
    ('Ice'),
    ('Fighting'),
    ('Poison'),
    ('Ground'),
    ('Flying'),
    ('Psychic'),
    ('Bug'),
    ('Rock'),
    ('Ghost'),
    ('Dragon'),
    ('Dark'),
    ('Steel'),
    ('Fairy')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS pokemons (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL UNIQUE,
    type1_id INTEGER REFERENCES types(id),
    type2_id INTEGER REFERENCES types(id)
);

INSERT INTO pokemons (name, type1_id, type2_id) 
VALUES
    ('Bulbasaur', 
    (SELECT id 
        FROM types 
        WHERE name = 'Grass'),
    (SELECT id
        FROM types
        WHERE name = 'Poison')
    ),
    ('Charmander', 
    (SELECT id 
        FROM types 
        WHERE name = 'Fire'),
    NULL
    ),
    ('Squirtle', 
    (SELECT id 
        FROM types 
        WHERE name = 'Water'),
    NULL
    )
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS trainers (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO trainers (name) 
VALUES
    ('Red')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS poke_inventories (
    trainer_id INTEGER REFERENCES trainers(id),
    pokemon_id INTEGER REFERENCES pokemons(id),
    caught_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (trainer_id, pokemon_id)
);

INSERT INTO poke_inventories (trainer_id, pokemon_id) 
VALUES
    (
        (SELECT id FROM trainers WHERE name = 'Red'), 
        (SELECT id FROM pokemons WHERE name = 'Bulbasaur')
    ),
    (
        (SELECT id FROM trainers WHERE name = 'Red'), 
        (SELECT id FROM pokemons WHERE name = 'Charmander')
    ),
    (
        (SELECT id FROM trainers WHERE name = 'Red'),
        (SELECT id FROM pokemons WHERE name = 'Squirtle')
    );

`;

async function main() {
  console.log("Seeding...");

  const connectionString = process.argv[2] || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERROR: No connection string provided.");
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();
  await client.query(SQL);
  await client.end();

  console.log("done.");
}

main();
