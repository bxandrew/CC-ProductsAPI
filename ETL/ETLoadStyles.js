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

const stylesCS = new pgp.helpers.ColumnSet([
  'id', 'product_id', 'name', 'original_price', 'sale_price', 'default_style'
], {table: 'styles'});

let stylesStream = fs.createReadStream('../../SDC-Data/styles.csv') //Papa can leverage the stream

const loadData = (currCS, stream) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;

      data.forEach((obj) => {
        obj.id = Number(obj.id);
        obj.product_id = Number(obj.productId);
        obj.default_style = Number(obj.default_style);
        obj.default_style = obj.default_style === 1 ? true : false;
      })

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
const dropStyles = 'DROP TABLE IF EXISTS styles;'
const createStyles = 'CREATE TABLE IF NOT EXISTS styles (id SERIAL PRIMARY KEY, product_id INT, name TEXT, original_price TEXT, sale_price TEXT, default_style BOOL);'


console.time(); // Start timer
db.connect()
  .then((client) => {
    sco = client; // Sco is our client object
    return sco.any(dropStyles); // Drop table
  }).then(() => {
    return sco.any(createStyles); // Create table
  }).then(() => {
    return loadData(stylesCS, stylesStream); // Load data into table
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done(); // Closes connection
    console.log('Connection end--------------');
  });

