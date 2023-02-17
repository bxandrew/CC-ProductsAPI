const productsIdStyles = async (req, res) => {
  console.log('GET request to /products/:id/styles');

  const id = Number(req.params.id);

  let styleIds = []; // an array of styleIds

  const styles = await pool.query(`SELECT id, name, original_price, sale_price, default_style FROM styles WHERE product_id = ${id}`)
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

  // If there are no styles associated with product id, simple send an empty array and end.
  if (!styleIds.length) {
    res.status(200);
    res.send([]);
    return;
  }

  const styleIdString = styleIds.join(', ');

  const photosCache = {};
  const photos = await pool.query(`SELECT style_id, thumbnail_url, url FROM photos WHERE style_id IN (${styleIdString})`)
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


  const skusCache = {};
  const skus = await pool.query(`SELECT style_id, id, size, quantity FROM skus WHERE style_id IN (${styleIdString})`)
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


  // Assign styles photos and skus here
  for (let style of styles) {
    style.photos = photosCache[style.style_id];
    style.skus = skusCache[style.style_id];
  }

  const styleJson = {
    product_id: req.params.id,
    results: styles
  }

  res.status(200);
  res.send(styleJson);
  res.end();
}

module.exports = productsIdStyles;