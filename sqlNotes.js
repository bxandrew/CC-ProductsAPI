

// For express route === products.get('/:id', async (req, res) => {
// console.time();
// let [ productResult ] = await client.query(`SELECT * FROM products WHERE id = ${id}`)
//   .then((res => {
//     console.timeLog();
//     return res.rows;
//   }));
// let featureResult = await client.query(`SELECT feature, value FROM features WHERE product_id = ${id}`)
//   .then((res) => {
//     console.timeLog();
//     console.timeEnd();
//     return res.rows
//   });
// let finalResult = {...productResult, features: featureResult};
// res.end();
// let finalResult = {...productResult, features: featureResult};

// let [ productResult ] = await client.query(`SELECT * FROM products WHERE id = ${id}`).then((res => res.rows));
// let featureResult = await client.query(`SELECT feature, value FROM features WHERE product_id = ${id}`).then((res) => res.rows);
// let finalResult = {...productResult, features: featureResult};

// This uses a join table to make it into one query 86ms avg (10% slower)
// let result = await client.query(`SELECT p.*, f.feature, f.value FROM products p RIGHT JOIN features f ON f.product_id = p.id WHERE p.id = ${id}`).then((res) => res.rows)


// `SELECT thumbnail_url, url FROM photos WHERE style_id = ${id}`

// `SELECT s.id, s.name, s.original_price, s.sale_price, s.default_style FROM styles s WHERE product_id = ${id}`
// {
//   id: 1,
//   name: 'Forest Green & Black',
//   original_price: '140',
//   sale_price: 'null',
//   default_style: true
// },


// CREATE INDEX product_features ON features(product_id);


// Gather  (cost=1000.00..29013.25 rows=3 width=28) (actual time=119.565..120.384 rows=0 loops=1)
// Workers Planned: 2
// Workers Launched: 2
// ->  Parallel Seq Scan on features  (cost=0.00..28012.95 rows=1 width=28) (actual time=103.213..103.213 rows=0 loops=3)
//       Filter: (product_id = 4441112)
//       Rows Removed by Filter: 739760
// Planning Time: 0.117 ms
// Execution Time: 120.405 ms

// Index Scan using product_features on features  (cost=0.43..8.48 rows=3 width=28) (actual time=0.061..0.062 rows=0 loops=1)
// Index Cond: (product_id = 4441112)
// Planning Time: 0.290 ms
// Execution Time: 0.075 ms

// Making indexs for styles sheet on product_id col;

// CREATE INDEX product_styles ON styles(product_id);

// DROP INDEX product_styles;
// If I want to drop index

// CREATE INDEX style_photos ON photos(style_id);

// Sequential Scan on photos before index
// Gather  (cost=1000.00..239287.99 rows=15 width=167) (actual time=4257.722..4258.926 rows=3 loops=1)
// Workers Planned: 2
// Workers Launched: 2
// ->  Parallel Seq Scan on photos  (cost=0.00..238286.49 rows=6 width=167) (actual time=2871.456..4244.383 rows=1 loops=3)
//       Filter: (style_id = 50000)
//       Rows Removed by Filter: 1885214
// Planning Time: 2.993 ms
// Execution Time: 4258.956 ms

// Index Scan using style_photos on photos  (cost=0.43..8.70 rows=15 width=167) (actual time=1.678..1.684 rows=3 loops=1)
// Index Cond: (style_id = 50000)
// Planning Time: 0.626 ms
// Execution Time: 1.706 ms


/// Searching through skus

// Gather  (cost=1000.00..121971.81 rows=13 width=15) (actual time=268.954..269.997 rows=6 loops=1)
// Workers Planned: 2
// Workers Launched: 2
// ->  Parallel Seq Scan on skus  (cost=0.00..120970.51 rows=5 width=15) (actual time=181.343..250.940 rows=2 loops=3)
//       Filter: (style_id = 52312)
//       Rows Removed by Filter: 3774637
// Planning Time: 0.132 ms
// Execution Time: 270.025 ms


// CREATE INDEX style_skus ON skus(style_id);

// Index Scan using style_skus on skus  (cost=0.43..8.66 rows=13 width=15) (actual time=0.724..0.726 rows=6 loops=1)
// Index Cond: (style_id = 52312)
// Planning Time: 0.390 ms
// Execution Time: 0.744 ms


// For related table pre index
// Gather  (cost=1000.00..48854.04 rows=5 width=12) (actual time=277.833..490.853 rows=3 loops=1)
// Workers Planned: 2
// Workers Launched: 2
// ->  Parallel Seq Scan on related  (cost=0.00..47853.54 rows=2 width=12) (actual time=407.086..477.802 rows=1 loops=3)
//       Filter: (current_product_id = 555111)
//       Rows Removed by Filter: 1502753
// Planning Time: 2.075 ms
// Execution Time: 490.886 ms

// Index Scan using product_related on related  (cost=0.43..8.52 rows=5 width=12) (actual time=0.149..0.151 rows=3 loops=1)
// Index Cond: (current_product_id = 555111)
// Planning Time: 0.569 ms
// Execution Time: 0.167 ms




// CREATE INDEX product_styles ON styles(product_id);
// CREATE INDEX product_features ON features(product_id);
// CREATE INDEX style_photos ON photos(style_id);
// CREATE INDEX style_skus ON skus(style_id);
// CREATE INDEX product_related ON related(current_product_id);





// Old Route for styles

  // Index of styleIds should directly match index of styles array
  // Next up, grab all the photos from each style
  // Photos should be an array of ordered photos for each style_id
  // Photos is now an array of promises
  // const photos = styleIds.map((styleId, index) => {
  //   return client.query(`SELECT thumbnail_url, url FROM photos WHERE style_id = ${styleId}`)
  //     .then((res) => {
  //       styles[index].photos = res.rows;
  //       return;
  //     });
  // })

  // const skus = styleIds.map((styleId, index) => {
  //   return client.query(`SELECT id, size, quantity FROM skus WHERE style_id = ${styleId}`)
  //     .then((res) => {
  //       // res.rows is an array of objects
  //       let skusObj = {};
  //       res.rows.forEach((sku) => {
  //         skusObj[sku.id] = { quantity: sku.quantity, size: sku.size };
  //       })
  //       styles[index].skus = skusObj;
  //       return;
  //     })
  // })

  // // return client.query(`SELECT thumbnail_url, url FROM photos WHERE style_id = ${styleId}`)
  // // return client.query(`SELECT id, size, quantity FROM skus WHERE style_id = ${styleId}`)


  // console.time();
  // Promise.all([skus, photos].map((arr, index) => {
  //   return Promise.all(arr).then(() => {
  //     console.log(`${index === 0 ? 'skus' : 'photos'} done`)
  //   });
  // })).then(() => {
  //   console.timeEnd();
  //   console.log(styles);
  //   let stylesJson = {
  //     product_id: req.params.id,
  //     results: styles,
  //   }
  //   res.status(200);
  //   res.send(stylesJson);
  //   res.end()
  // }).catch(() => {
  //   console.log('Error occured getting styles');
  //   res.end();
  // })



// GET request to /products/:id
// default: 1.633ms
// default: 2.429ms
// default: 2.503ms
// GET request to /products/:id
// default: 1.316ms
// default: 3.495ms
// default: 3.765ms
// GET request to /products/:id
// default: 2.626ms
// default: 4.684ms
// default: 4.782ms



// GET request to /products/:id/styles
// Time to getting all styles
// default: 3.128ms
// Time to getting all photos
// default: 4.251ms
// Time to getting all skus
// default: 5.12ms
// Sending JSON object out from styles
// default: 5.155ms
// GET request to /products/:id/styles
// Time to getting all styles
// default: 0.983ms
// Time to getting all photos
// default: 1.996ms
// Time to getting all skus
// default: 3.299ms
// Sending JSON object out from styles
// default: 3.376ms


// GET request to /products/:id/related
// Time to getting all related products and sending JSON object out
// default: 1.124ms
// default: 1.192ms
// GET request to /products/:id/related
// Time to getting all related products and sending JSON object out
// default: 0.799ms
// default: 0.865ms
// GET request to /products/:id/related
// Time to getting all related products and sending JSON object out
// default: 1.079ms
// default: 1.383ms