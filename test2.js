const events = require('events');
const fs = require('fs');
const readline = require('readline');


let csvData = [];

async function processLineByLine() {
  try {
    const rl = readline.createInterface({
      input: fs.createReadStream('../SDC-Data/testproduct1.csv'),
      crlfDelay: Infinity
    });

  rl.on('line', (line) => {
    // csvData.push(line.split(','));
    let currLine = line.split(','); // turn line into an array
    currLine[0] = Number(currLine[0]);

    client.query()
  });

  await events.once(rl, 'close');
  console.log(csvData);

  console.log('Reading  file line by line with readline done.');
  console.timeEnd();

  return 'hello';
  } catch (err) {
    console.log(err);
  }
}

// processLineByLine();

console.log("I am running ETLoad");

module.exports.processLineByLine = processLineByLine;
