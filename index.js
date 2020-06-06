const path = require('path');
const parseTransactionsFile = require('./modules/parseTransactionsFile');
const processTransactionList = require('./modules/processTransactionList');
const writeResultsToFile = require('./modules/writeResultsToFile');

const transactionList = parseTransactionsFile(
  path.resolve(__dirname, './takehome/input.txt')
);

const resultList = processTransactionList(transactionList);
writeResultsToFile(path.resolve(__dirname, './output/output.txt'), resultList);
