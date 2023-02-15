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

  const startingId = (page * count) - count + 1;
  const endingId = startingId + count;
  console.log(startingId);
  console.log(endingId);

  let results = await client.query(`SELECT * FROM products WHERE id >= ${startingId} AND id < ${endingId}`)
    .then((res) => res.rows)
    .catch((e) => console.log(e))
  console.log(results);
  res.end();
})

// [
//   {
//         "id": 1,
//         "name": "Camo Onesie",
//         "slogan": "Blend in to your crowd",
//         "description": "The So Fatigues will wake you up and fit you in. This high energy camo will have you blending in to even the wildest surroundings.",
//         "category": "Jackets",
//         "default_price": "140"
//     },
//   {
//         "id": 2,
//         "name": "Bright Future Sunglasses",
//         "slogan": "You've got to wear shades",
//         "description": "Where you're going you might not need roads, but you definitely need some shades. Give those baby blues a rest and let the future shine bright on these timeless lenses.",
//         "category": "Accessories",
//         "default_price": "69"
//     }
// ]


products.get('/:id', (req, res) => {
  console.log('GET request to /products/:id');
  // Tskes product_id as param

  res.end();
})

products.get('/:id/styles', (req, res) => {
  console.log('GET request to /products/:id/styles');

  // Takes product_id as param
  res.end();
})

products.get('/:id/related', (req, res) => {
  console.log('GET request to /products/:id/related');

  // Takes product_id as params

  res.end();
})

module.exports = products;
// console.log(products);