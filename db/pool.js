require("dotenv").config();
const { Pool } = require("pg");

module.exports = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Tells Node to skip verifying the certificate chain
  },
});
