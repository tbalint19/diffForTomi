const original = require('./original.json')
const updated = require('./updated.json')

const differences = require('./diff.js');

const result = differences(original, updated, "InitConfig")

for (let difference of result) {
  console.log("\n-----\n");
  console.log(difference);
  console.log("\n-----\n");
}
