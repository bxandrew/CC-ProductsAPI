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

const relatedCS = new pgp.helpers.ColumnSet([
  'id', 'current_product_id', 'related_product_id'
], {table: 'related'});

let relatedStream = fs.createReadStream('../../SDC-Data/related.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;

      data.forEach((obj) => {
        obj.id = Number(obj.id);
        obj.current_product_id = Number(obj.current_product_id);
        obj.related_product_id = Number(obj.related_product_id);
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
const dropRelated = 'DROP TABLE IF EXISTS related;'
const createRelated = 'CREATE TABLE IF NOT EXISTS related (id SERIAL PRIMARY KEY, current_product_id INT, related_product_id INT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropRelated); // Drop table
  }).then(() => {
    return sco.any(createRelated); // Create table
  }).then(() => {
    return loadData(relatedCS, relatedStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

