const fs = require('fs');
const { Client } = require('pg')
const Papa = require('papaparse');
const pgp = require('pg-promise')({ capSQL: true});

const db = pgp({
  host: 'localhost',
  user: 'andrew',
  port: 5432,
  password: 'andrew',
  database: 'testproducts'
})

const currentCS = new pgp.helpers.ColumnSet([
  'name', 'slogan', 'description', 'category', 'default_price'
], {table: 'test'});

// const client = new Client({
//   host: 'localhost',
//   user: 'andrew',
//   port: 5432,
//   password: 'andrew',
//   database: 'testproducts'
// })

// const text = 'INSERT INTO test(name, slogan, description, category, default_price) VALUES ($1, $2, $3, $4, $5) RETURNING *'
// client.query(text, formattedData).then((res) => {
//   console.log(res.rows[0]);
// })

// const connectDb = async () => {
//   try {
//     await client.connect();
//     await dropTable();
//     await createTable();

//     console.log('Client connected');
//   } catch (err) {
//     console.log(err);
//   }
// }

let stream = fs.createReadStream('../SDC-Data/product.csv') //Papa can leverage the stream

const loadData = () => {
  Papa.parse(stream, {
    header: true,
    // dynamicTyping: true,
    chunk: (results, parser) => {
      console.log(results.data);
      const data = results.data;
      // const text = ('INSERT INTO test(name, slogan, description, category, default_price) VALUES ()');
      // client.query(text, data)
    },
  })
}

const dropTable = async () => {
  await client.query('DROP TABLE IF EXISTS test;')
}

const createTable = async () => {
  await client.query('CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT, slogan TEXT, description TEXT, category TEXT, default_price TEXT);');
}

// const loadTable = async () => {
//   await client.query('')
// }


// connectDb();
loadData();

// CREATE TABLE IF NOT EXISTS test (
//   id SERIAL PRIMARY KEY,
//   name TEXT,
//   slogan TEXT,
//   description TEXT,
//   category TEXT,
//   default_price TEXT
// );

// COPY
// COPY employee_import FROM ‘/var/lib/postgresql/employee.csv’ csv header;

// COPY test FROM '/Users/andrew/Desktop/Hack Reactor/SDC-Data/products.csv' csv header;

//COPY test FROM '/Users/andrew/Desktop/Hack Reactor/SDC-Data/product.csv' csv header;
