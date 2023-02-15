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

const productsCS = new pgp.helpers.ColumnSet([
'id', 'name', 'slogan', 'description', 'category', 'default_price'
], {table: 'products'});

let productsStream = fs.createReadStream('../../SDC-Data/product.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    // dynamicTyping: true,
    chunk: (results, parser) => {
      const data = results.data;

      // Parse id to int
      data.forEach((obj) => {
        obj.id = Number(obj.id);
      });

      // console.log(data);
      const insert = pgp.helpers.insert(data, currCS);
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
const dropProducts = 'DROP TABLE IF EXISTS products;'
const createProducts = 'CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT, slogan TEXT, description TEXT, category TEXT, default_price TEXT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropProducts); // Drop table
  }).then(() => {
    return sco.any(createProducts); // Create table
  }).then(() => {
    return loadData(productsCS, productsStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

