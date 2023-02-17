const productsId = async (req, res) => {
  console.log('GET request to /products/:id');

  const id = Number(req.params.id);

  let productResult;
  let featureResult;

  const products = await pool.query(`SELECT * FROM products WHERE id = ${id}`)
    .then((res) => {
      productResult = res.rows[0];
    }).catch(() => {
      console.log('Error retrieving from products');
      res.status(404);
      res.end();
    })

  const features = await pool.query(`SELECT feature, value FROM features WHERE product_id = ${id}`)
    .then((res) => {
      featureResult = res.rows
    }).catch(() => {
      console.log('Error retrieving from features');
      res.status(404);
      res.end();
    })

  let finalResult = {...productResult, features: featureResult};
  res.status(200);
  res.send(finalResult);
}

module.exports = productsId;