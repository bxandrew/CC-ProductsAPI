const { Pool, Client } = require('pg');
const productsIndex = require('./productsIndex');
const productsId = require('./productsId');
const productsIdStyles = require('./productsIdStyles');
const productsIdRelated = require('./productsIdRelated');
// console.log(productsIndex, productsId, productsIdStyles, productsIdRelated);

const pool = new Pool({
  host: 'localhost',
  user: 'andrew',
  port: 5432,
  password: 'andrew',
  database: 'productsdb'
})

pool.connect().then(() => console.log('Successfully connected to PostgreSQL!'));

const closeConnection = () => {
  return pool.end().then(() => console.log('Closed connection to PostgreSQL!'));
}

module.exports = { productsIndex, productsId, productsIdStyles, productsIdRelated, closeConnection };