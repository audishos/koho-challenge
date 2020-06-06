const path = require('path');
const parseTransactionsFile = require('./modules/parseTransactionsFile');
const processTransactionsList = require('./modules/processTransactionsList');
const writeResultsToFile = require('./modules/writeResultsToFile');

const transactionList = parseTransactionsFile(
  path.resolve(__dirname, './takehome/input.txt')
);

const resultList = processTransactionsList(transactionList);
writeResultsToFile(path.resolve(__dirname, './output/output.txt'), resultList);
