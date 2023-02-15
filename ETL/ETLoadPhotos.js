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

const photosCS = new pgp.helpers.ColumnSet([
  'id', 'style_id', 'url', 'thumbnail_url'
], {table: 'photos'});

let photosStream = fs.createReadStream('../../SDC-Data/photos.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;

      data.forEach((obj) => {
        obj.id = Number(obj.id);
        obj.style_id = Number(obj.styleId);
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
const dropPhotos = 'DROP TABLE IF EXISTS photos;'
const createPhotos = 'CREATE TABLE IF NOT EXISTS photos (id SERIAL PRIMARY KEY, style_id INT, url TEXT, thumbnail_url TEXT);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropPhotos); // Drop table
  }).then(() => {
    return sco.any(createPhotos); // Create table
  }).then(() => {
    return loadData(photosCS, photosStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

