const productsIndex = async (req, res) => {
  console.log('GET request to /products');
  // console.log(req.query);

  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;

  const startingId = (page * count) - count + 1;
  const endingId = startingId + count;

  let results = await pool.query(`SELECT * FROM products WHERE id >= ${startingId} AND id < ${endingId}`)
    .then((res) => {
      return res.rows;
    })
    .catch((e) => console.log(e))

  res.status(200);
  res.send(results);
}

module.exports = productsIndex;