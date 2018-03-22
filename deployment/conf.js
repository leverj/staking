const fs     = require('fs');
const affirm = require('affirm.js');

["FEE_CONSTRUCTOR", "STAKE_CONSTRUCTOR", "NETWORK", "MAX_GAS_PRICE",]
  .forEach(envName => affirm(process.env[envName], `Environment variable ${envName} is missing`))

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

module.exports = {
  network   : process.env.NETWORK,
  fee       : {
    values : JSON.parse(process.env.FEE_CONSTRUCTOR),
    address: process.env.FEE_ADDRESS
  },
  stake     : {
    values : JSON.parse(process.env.STAKE_CONSTRUCTOR),
    address: process.env.STAKE_ADDRESS
  },
  maxGas    : process.env.MAX_GAS_PRICE - 0,
  privateKey: getPrivateKey()
}

