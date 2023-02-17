const { Pool, Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  port: process.env.PORT,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

// pool.connect().then(() => console.log('Successfully connected to PostgreSQL!'));
// pool.end();

const closeConnection = () => {
  return pool.end().then(() => console.log('Closed connection to PostgreSQL!'));
}

module.exports = {
  query: (queryString) => {
    return pool.query(queryString);
  },
  closeConnection,
}