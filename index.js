const path = require('path');
const { INPUT_PATH, OUTPUT_PATH } = require('./modules/constants');
const parseTransactionsFile = require('./modules/parseTransactionsFile');
const processTransactionList = require('./modules/processTransactionList');
const writeResultsToFile = require('./modules/writeResultsToFile');

const inputPath = path.resolve(__dirname, INPUT_PATH);
console.log(`loading transactions from file: ${inputPath} ...`);
const transactionList = parseTransactionsFile(inputPath);
console.log(`${transactionList.length} transactions loaded`);
console.log('processing transactions...');
const resultList = processTransactionList(transactionList);
const outputPath = path.resolve(__dirname, OUTPUT_PATH);
console.log('processing transactions complete.');
console.log(`writing transaction results to file: ${outputPath}`);
writeResultsToFile(outputPath, resultList);
console.log('done!');
