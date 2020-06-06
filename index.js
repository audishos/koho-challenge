const path = require('path');
const parseTransactionsFile = require('./modules/parseTransactionsFile');
const processTransactionsList = require('./modules/processTransactionsList');

const transactionList = parseTransactionsFile(
  path.resolve(__dirname, './takehome/input.txt')
);

const resultList = processTransactionsList(transactionList);
console.log(resultList);
