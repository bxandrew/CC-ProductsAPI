const express = require('express');
const cors = require('cors');
const { productsIndex, productsId, productsIdStyles, productsIdRelated } = require('../controllers/products.controller');

products = express.Router();


products.get('/', productsIndex);
products.get('/:id', productsId);
products.get('/:id/styles', productsIdStyles);
products.get('/:id/related', productsIdRelated);



module.exports = products;
