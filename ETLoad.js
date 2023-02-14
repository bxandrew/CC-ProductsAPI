const events = require('events');
const fs = require('fs');
const readline = require('readline');


let csvData = [];

async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream('../SDC-Data/product.csv'),
      crlfDelay: Infinity
    });

  rl.on('line', (line) => {
    csvData.push(line.split(','));
  });

  await events.once(rl, 'close');
  console.log(csvData);

  console.log('Reading  file line by line with readline done.');
  console.timeEnd();
  } catch (err) {
    console.log(err);
  }
}

processLineByLine();