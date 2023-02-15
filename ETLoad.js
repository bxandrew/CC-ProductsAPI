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

let stream = fs.createReadStream('../SDC-Data/product.csv') //Papa can leverage the stream

const loadData = () => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;
      const insert = pgp.helpers.insert(data, currentCS);
      db.none(insert)
        .then((data) => {
          console.log('Success, current batch inserted');
          console.timeLog();
        })
        .catch((err) => {
          throw Error(err);
        });
    },
    complete: () => {
      console.log('Finished reading all CSV data');
    }
  })
}

let sco; // Shared connection object;
const dropTable = 'DROP TABLE IF EXISTS test;'
const createTable = 'CREATE TABLE IF NOT EXISTS test (id SERIAL PRIMARY KEY, name TEXT, slogan TEXT, description TEXT, category TEXT, default_price TEXT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropTable); // Drop table
  }).then(() => {
    return sco.any(createTable); // Create table
  }).then(() => {
    return loadData(); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });


// Promise.all(allPromises).then(() => console.log(allPromises));

// loadData();

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

//SELECT * FROM test WHERE name = 'Aron Sweatpants';
