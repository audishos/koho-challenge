const fs = require('fs');
const path = require('path');

function writeResultsToFile(filePath, results) {
  const dirPath = path.dirname(filePath);
  fs.mkdirSync(dirPath, { recursive: true });

  fs.writeFileSync(
    filePath,
    results.map(result => JSON.stringify(result)).join('\n'),
    { flag: 'w' }
  );
}

module.exports = writeResultsToFile;
