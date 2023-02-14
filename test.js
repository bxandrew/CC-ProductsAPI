const fs = require('fs');
const fastcsv = require('fast-csv');

let stream = fs.createReadStream('../SDC-Data/product.csv')
console.time();
let csvData = [];
let csvStream = fastcsv
  .parse()
  .on('data', (data) => {
    csvData.push(data);
  })
  .on('end', () => {
    console.log('i am ending');
    console.timeEnd();
  })

stream.pipe(csvStream);
