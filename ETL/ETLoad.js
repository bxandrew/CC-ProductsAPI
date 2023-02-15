const fs = require('fs');
const { Client } = require('pg');
const Papa = require('papaparse');
const pgp = require('pg-promise')({ capSQL: true});

const db = pgp({
  host: 'localhost',
  user: 'andrew',
  port: 5432,
  password: 'andrew',
  database: 'productsdb'
});

let sco; // Shared connection object;

// All CSV streams
const photosStream = fs.createReadStream('../../SDC-Data/photos.csv');
const featuresStream = fs.createReadStream('../../SDC-Data/features.csv');
const skusStream = fs.createReadStream('../../SDC-Data/skus.csv');
const productsStream = fs.createReadStream('../../SDC-Data/product.csv');
const relatedStream = fs.createReadStream('../../SDC-Data/related.csv');
const stylesStream = fs.createReadStream('../../SDC-Data/styles.csv');

// Photos Table
const photosCS = new pgp.helpers.ColumnSet([
  'id', 'style_id', 'url', 'thumbnail_url'
], {table: 'photos'});
const dropPhotos = 'DROP TABLE IF EXISTS photos;';
const createPhotos = 'CREATE TABLE IF NOT EXISTS photos (id SERIAL PRIMARY KEY, style_id INT, url TEXT, thumbnail_url TEXT);';
const photosParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
    obj.style_id = Number(obj.styleId);
  });
}

// Features Table
const featuresCS = new pgp.helpers.ColumnSet([
  'id', 'product_id', 'feature', 'value'
], {table: 'features'});
const dropFeatures = 'DROP TABLE IF EXISTS features;'
const createFeatures = 'CREATE TABLE IF NOT EXISTS features (id SERIAL PRIMARY KEY, product_id INT, feature TEXT, value TEXT);'
const featuresParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
    obj.product_id = Number(obj.id);
  });
}

// Skus Table
const skusCS = new pgp.helpers.ColumnSet([
  'id', 'style_id', 'size', 'quantity'
], {table: 'skus'});
const dropSkus = 'DROP TABLE IF EXISTS skus;';
const createSkus = 'CREATE TABLE IF NOT EXISTS skus (id SERIAL PRIMARY KEY, style_id INT, size TEXT, quantity INT);';
const skusParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
    obj.style_id = Number(obj.styleId);
    obj.quantity = Number(obj.quantity);
  });
}

// Products Table
const productsCS = new pgp.helpers.ColumnSet([
  'id', 'name', 'slogan', 'description', 'category', 'default_price'
], {table: 'products'});
const dropProducts = 'DROP TABLE IF EXISTS products;';
const createProducts = 'CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name TEXT, slogan TEXT, description TEXT, category TEXT, default_price TEXT);';
const productsParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
  });
}

// Related Table
const relatedCS = new pgp.helpers.ColumnSet([
  'id', 'current_product_id', 'related_product_id'
], {table: 'related'});
const dropRelated = 'DROP TABLE IF EXISTS related;';
const createRelated = 'CREATE TABLE IF NOT EXISTS related (id SERIAL PRIMARY KEY, current_product_id INT, related_product_id INT);';
const relatedParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
    obj.current_product_id = Number(obj.current_product_id);
    obj.related_product_id = Number(obj.related_product_id);
  });
}

// Styles table
const stylesCS = new pgp.helpers.ColumnSet([
  'id', 'product_id', 'name', 'original_price', 'sale_price', 'default_style'
], {table: 'styles'});
const dropStyles = 'DROP TABLE IF EXISTS styles;';
const createStyles = 'CREATE TABLE IF NOT EXISTS styles (id SERIAL PRIMARY KEY, product_id INT, name TEXT, original_price TEXT, sale_price TEXT, default_style BOOL);';
const stylesParse = (data) => {
  data.forEach((obj) => {
    obj.id = Number(obj.id);
    obj.product_id = Number(obj.productId);
    obj.default_style = Number(obj.default_style);
    obj.default_style = obj.default_style === 1 ? true : false;
  });
}

const loadData = (currCS, stream, parseCB, name) => {
  Papa.parse(stream, {
    header: true,
    chunk: (results, parser) => {
      const data = results.data;
      parseCB(data);
      const insert = pgp.helpers.insert(data, currCS);
      db.none(insert)
        .then((data) => {
          // console.log(`Success, current batch inserted from ${name}`);
        })
        .catch((err) => {
          throw Error(err);
        });
    },
    complete: () => {
      console.log(`Finished reading all CSV data from ${name}`);
      console.timeLog();
    }
  })
}

console.time(); // Start timer
db.connect()
  .then(async (client) => {
    sco = client; // Sco is our client object
    // Drop all tables first
    await sco.any(dropPhotos);
    await sco.any(dropFeatures);
    await sco.any(dropSkus);
    await sco.any(dropProducts);
    await sco.any(dropRelated);
    await sco.any(dropStyles);
    return;
  }).then(async () => {
    // Create all tables
    await sco.any(createPhotos);
    await sco.any(createFeatures);
    await sco.any(createSkus);
    await sco.any(createProducts);
    await sco.any(createRelated);
    await sco.any(createStyles);
    return;
  }).then(async () => {
    // Load all tables
    loadData(photosCS, photosStream, photosParse, 'photos'); // Load data into table
    loadData(featuresCS, featuresStream, featuresParse, 'features'); // Load data into table
    loadData(skusCS, skusStream, skusParse, 'skus'); // Load data into table
    loadData(productsCS, productsStream, productsParse, 'products'); // Load data into table
    loadData(relatedCS, relatedStream, relatedParse, 'related'); // Load data into table
    loadData(stylesCS, stylesStream, stylesParse, 'styles'); // Load data into table
    return;
  }).catch(err => console.log(err))
  .finally(() => {
    sco.done();
    console.log('Connection closed');
  });

