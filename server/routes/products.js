const express = require('express');
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  user: 'andrew',
  port: 5432,
  password: 'andrew',
  database: 'productsdb'
});

client.connect().then(() => console.log('Successfully connected to PostgreSQL!'));

products = express.Router();

products.get('/', async (req, res) => {
  console.log('GET request to /products');

  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  // const startingId = (page * count) - count + 1;
  // const endingId = startingId + count;
  const offset = (page * count) - count;

  // let results = await client.query(`SELECT * FROM products WHERE id >= ${startingId} AND id < ${endingId}`)
  let results = await client.query(`SELECT * FROM products LIMIT ${count} OFFSET ${offset}`)
    .then((res) => res.rows)
    .catch((e) => console.log(e))
  // console.log(results);

  res.status(200);
  res.send(results);
})

products.get('/:id', async (req, res) => {
  console.log('GET request to /products/:id');

  const id = Number(req.params.id);

  let productResult;
  let featureResult;

  console.time();
  const products = await client.query(`SELECT * FROM products WHERE id = ${id}`)
    .then((res) => {
      productResult = res.rows[0];
      console.log('Time to getting products')
      console.timeLog();
    }).catch(() => {
      console.log('Error retrieving from products');
      res.status(404);
      res.end();
    })

  const features = await client.query(`SELECT feature, value FROM features WHERE product_id = ${id}`)
    .then((res) => {
      console.log('Time to getting features')
      console.timeLog();
      featureResult = res.rows
    }).catch(() => {
      console.log('Error retrieving from features');
      res.status(404);
      res.end();
    })

  let finalResult = {...productResult, features: featureResult};
  console.log('Time to sending JSON obj out');
  console.timeEnd();
  res.status(200);
  res.send(finalResult);
})

products.get('/:id/styles', async (req, res) => {
  console.log('GET request to /products/:id/styles');

  const id = Number(req.params.id);

  let styleIds = []; // an array of styleIds

  console.time();
  const styles = await client.query(`SELECT id, name, original_price, sale_price, default_style FROM styles WHERE product_id = ${id}`)
    .then((res) => {
      return res.rows.map((style) => {
        styleIds.push(style.id);

        return {
          style_id: style.id,
          name: style.name,
          original_price: style.original_price + '.00',
          sale_price: style.sale_price === 'null' ? null : style.sale_price + '.00',
          'default?': style.default_style,
          photos: [],
          skus: {},
        }
      });
    }).catch(() => {
      console.log('Error retrieving styles');
      res.status(404);
      res.end();
    })

  console.log('Time to getting all styles');
  console.timeLog();
  // If there are no styles associated with product id, simple send an empty array and end.
  if (!styleIds.length) {
    res.status(200);
    res.send([]);
    res.end();
    return;
  }

  const styleIdString = styleIds.join(', ');

  const photosCache = {};
  const photos = await client.query(`SELECT style_id, thumbnail_url, url FROM photos WHERE style_id IN (${styleIdString})`)
    .then((res) => {
      // Iterate through all the objects, res.rows is an array
      res.rows.forEach((photoObj) => {
        if (!photosCache[photoObj.style_id]) {
          photosCache[photoObj.style_id] = [];
        }
        const { thumbnail_url, url } = photoObj;
        let parsePhoto = { thumbnail_url, url };
        photosCache[photoObj.style_id].push(parsePhoto);
      })
    }).catch(() => {
      console.log('Error retrieving photos');
      res.status(404);
      res.end();
    })

  console.log('Time to getting all photos');
  console.timeLog();

  const skusCache = {};
  const skus = await client.query(`SELECT style_id, id, size, quantity FROM skus WHERE style_id IN (${styleIdString})`)
  .then((res) => {
    res.rows.forEach((sku) => {
      if (!skusCache[sku.style_id]) {
        skusCache[sku.style_id] = {};
      }
      const { quantity, size } = sku;
      skusCache[sku.style_id][sku.id] = { quantity, size };
    })
  }).catch(() => {
    console.log('Error retrieving skus');
    res.status(404);
    res.end()
  })

  console.log('Time to getting all skus');
  console.timeLog();

  // Assign styles photos and skus here
  for (let style of styles) {
    style.photos = photosCache[style.style_id];
    style.skus = skusCache[style.style_id];
  }

  console.log('Sending JSON object out from styles');
  console.timeEnd();
  res.status(200);
  res.send(styles);
  res.end();
})

products.get('/:id/related', async (req, res) => {
  console.log('GET request to /products/:id/related');

  const id = req.params.id;
  let relatedProducts;

  console.time();
  const relatedIds = await client.query(`SELECT related_product_id FROM related WHERE current_product_id = ${id}`)
    .then((res) => {
      relatedProducts = res.rows.map((obj) => obj.related_product_id);
    }).catch(() => {
      res.status(404);
      res.end();
    })

  console.log('Time to getting all related products and sending JSON object out');
  console.timeLog();
  console.timeEnd();

  res.send(relatedProducts);
})

module.exports = products;