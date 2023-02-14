const express = require('express');
const app = express();
const port = 3000;

const productsRoute = require('./routes/products.js');
const qaRoute = require('./routes/qa.js');
const reviewsRoute = require('./routes/reviews.js');

app.use('/products', productsRoute);
app.use('/qa', qaRoute);
app.use('/reviews', reviewsRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});