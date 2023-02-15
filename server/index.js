const express = require('express');
const app = express();
const port = 3000;

const products = require('./routes/products.js');
// console.log(products);

app.use('/products', products);








app.listen(port, () => {
  console.log(`SDC-Products API service successfully started on ${port}`);
});


// const qaRoute = require('./routes/qa.js');
// const reviewsRoute = require('./routes/reviews.js');
// app.use('/qa', qaRoute);
// app.use('/reviews', reviewsRoute);