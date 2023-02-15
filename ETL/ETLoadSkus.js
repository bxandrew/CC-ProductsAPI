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

const skusCS = new pgp.helpers.ColumnSet([
  'id', 'style_id', 'size', 'quantity'
], {table: 'skus'});

let skusStream = fs.createReadStream('../../SDC-Data/skus.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;

      data.forEach((obj) => {
        obj.id = Number(obj.id);
        obj.style_id = Number(obj.styleId);
        obj.quantity = Number(obj.quantity);
      })

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
const dropSkus = 'DROP TABLE IF EXISTS skus;'
const createSkus = 'CREATE TABLE IF NOT EXISTS skus (id SERIAL PRIMARY KEY, style_id INT, size TEXT, quantity INT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropSkus); // Drop table
  }).then(() => {
    return sco.any(createSkus); // Create table
  }).then(() => {
    return loadData(skusCS, skusStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

