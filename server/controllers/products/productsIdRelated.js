const productsIdRelated = async (req, res) => {
  console.log('GET request to /products/:id/related');

  const id = req.params.id;
  let relatedProducts;

  const relatedIds = await pool.query(`SELECT related_product_id FROM related WHERE current_product_id = ${id}`)
    .then((res) => {
      relatedProducts = res.rows.map((obj) => obj.related_product_id);
    }).catch(() => {
      res.status(404);
      res.end();
    })

  res.send(relatedProducts);
}

module.exports = productsIdRelated;