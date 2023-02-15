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

const featuresCS = new pgp.helpers.ColumnSet([
  'id', 'product_id', 'feature', 'value'
], {table: 'features'});

let featuresStream = fs.createReadStream('../SDC-Data/features.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;

      data.forEach((obj) => {
        obj.id = Number(obj.id);
        obj.product_id = Number(obj.id);
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
const dropFeatures = 'DROP TABLE IF EXISTS features;'
const createFeatures = 'CREATE TABLE IF NOT EXISTS features (id SERIAL PRIMARY KEY, product_id INT, feature TEXT, value TEXT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropFeatures); // Drop table
  }).then(() => {
    return sco.any(createFeatures); // Create table
  }).then(() => {
    return loadData(featuresCS, featuresStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

