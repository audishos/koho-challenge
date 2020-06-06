const fs = require('fs');

function parseFundsFile(filePath) {
  const loadFunds = fs.readFileSync(filePath, 'utf8');

  return (
    loadFunds
      .split('\n')
      .map((fund, i) => {
        let fundObj;
        try {
          fundObj = JSON.parse(fund);
        } catch (e) {
          console.warn(
            `Unable to parse line ${i + 1}:"${fund}". Not valid JSON.`
          );
          return null;
        }

        fundObj.load_amount = parseFloat(fundObj.load_amount.replace('$', ''));
        fundObj.time = Date.parse(fundObj.time);
        return fundObj;
      })
      .filter(x => x)
      // this isn't needed for input.txt, but might as well make it safe for other files
      .sort((a, b) => a.time - b.time)
  );
}

module.exports = parseFundsFile;
