const fs = require('fs');

function parseTransactionsFile(filePath) {
  const transactions = fs.readFileSync(filePath, 'utf8');

  return (
    transactions
      .split('\n')
      .map((transactionString, i) => {
        if (!transactionString) {
          return null;
        }

        let transaction;
        try {
          transaction = JSON.parse(transactionString);
        } catch (e) {
          console.warn(
            `Unable to parse line ${
              i + 1
            }:"${transactionString}". Not valid JSON.`
          );
          return null;
        }

        transaction.load_amount = parseFloat(
          transaction.load_amount.replace('$', '')
        );

        transaction.time = getDateInMillis(transaction.time);

        return transaction;
      })
      .filter(x => x)
      // this isn't needed for input.txt, but might as well make it safe for other files
      .sort((a, b) => a.time - b.time)
  );
}

module.exports = parseTransactionsFile;

function getDateInMillis(dateString) {
  const date = new Date(dateString);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
}
