const path = require('path');
const parseFundsFile = require('./modules/parseFundsFile');
const processLoadEvents = require('./modules/processLoadEvents');

const fundList = parseFundsFile(
  path.resolve(__dirname, './takehome/input.txt')
);

const resultsList = processLoadEvents(fundList);
console.log(resultsList);
