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
//already going to /products

products.get('/', async (req, res) => {
  console.log('GET request to /products');

  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  // const startingId = (page * count) - count + 1;
  // const endingId = startingId + count;
  const offset = (page*count) - count;

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

  let allPromises = [];
  let productResult;
  let featureResult;
  console.time();

  // Promisify both queries to execute at the same time. (Looks like it saves 5ms);
  allPromises.push(client.query(`SELECT * FROM products WHERE id = ${id}`)
    .then((res) => {
      productResult = res.rows[0];
      console.timeLog();
    })
  );

  allPromises.push(client.query(`SELECT feature, value FROM features WHERE product_id = ${id}`)
    .then((res) => {
      console.timeLog();
      featureResult = res.rows
    }))

  Promise.all(allPromises).then(() => {
    let finalResult = {...productResult, features: featureResult};
    console.timeEnd();
    res.status(200);
    res.send(finalResult);
    res.end();
  }).catch(() => {
    res.status(404);
    res.end();
  })
})

products.get('/:id/styles', async (req, res) => {
  console.log('GET request to /products/:id/styles');

  const id = Number(req.params.id);

  let styleIds;

  // console.time();
  const styles = await client.query(`SELECT id, name, original_price, sale_price, default_style FROM styles WHERE product_id = ${id}`)
    .then((res) => {
      //iterate through each res.rows object
      styleIds = res.rows.map((style) => style.id);
      // console.timeLog();
      return res.rows;
    })

  // Index of styleIds should directly match index of styles array
  // Next up, grab all the photos from each style
  // Photos should be an array of ordered photos for each style_id
  // Photos is now an array of promises
  const photos = styleIds.map((styleId, index) => {
    return client.query(`SELECT thumbnail_url, url FROM photos WHERE style_id = ${styleId}`)
      .then((res) => {
        styles[index].photos = res.rows;
        return;
      });
  })

  const skus = styleIds.map((styleId, index) => {
    return client.query()
  })

  console.time();
  Promise.all(photos).then(() => {
    console.timeEnd();
  });

  // console.log('https://images.unsplash.com/photo-1549831243-a69a0b3d39e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2775&q=80'.length);

  // Takes product_id as param
  // console.timeEnd();
  res.end();
})




// {
//   product_id: 'string', // grab from params
//   results: [ //an array of style objects
//     {
//       style_id, name, original_price, sale_price, 'default?',
//       photos: [
//         {thumbnail_url, url}, ...{ }
//       ],
//       skus: [
//         123123: {quantity, size},
//         123124: {},
//       ]
//     },
//     {
//       //another style object
//     }
//   ]
// }

products.get('/:id/related', (req, res) => {
  console.log('GET request to /products/:id/related');

  // Takes product_id as params

  res.end();
})

module.exports = products;
// console.log(products);