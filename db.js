const { Client } = require('pg')
const { processLineByLine } = require('./test2');

const connectDb = async () => {
  try {
    const client = new Client({
      host: 'localhost',
      user: 'andrew',
      port: 5432,
      password: 'andrew',
      database: 'testproducts'
    })
    await client.connect()

    // await our ETLoad func (it'll return hello)
    const res = await processLineByLine();
    console.log(res);


    await client.end();
  } catch (err) {
    console.log(err);
  }
}

connectDb();

//[
//   '20',
//   'Matilda Jacket',
//   'Quidem doloribus iusto omnis ducimus.',
//   'Omnis molestias sed ut officia eos labore nulla dolor voluptatem. Repudiandae praesentium culpa. Adipisci sint assumenda earum ex est. Fugiat sint molestiae. Ea laborum aperiam iure.',
//   'Jacket',
//   '950'
// ]