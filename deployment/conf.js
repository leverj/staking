const fs = require('fs');
const affirm = require('affirm.js');
affirm(process.env.NODE_ENV, 'set NODE_ENV environment')
const configuration = require(`./${process.env.NODE_ENV}.json`);

function getPrivateKey() {
  affirm(process.argv[2], 'Provide private key file location of Operator');
  try {
    let keyFile = fs.readFileSync(process.argv[2]);
    return JSON.parse(keyFile).privateKey;
  } catch (e) {
    console.log("Operator private ky file is invalid.", process.argv[2], e);
    process.exit(1);
  }
}

module.exports = {configuration, key: getPrivateKey()};
