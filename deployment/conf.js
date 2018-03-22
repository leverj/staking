const fs     = require('fs');
const path   = require('path')
const affirm = require('affirm.js')

module.exports = (function () {
  function getConf() {
    affirmEnvVariables()
    let privateKey = getPrivateKey()
    let network    = process.env.NETWORK;
    let Fee        = {
      values : JSON.parse(process.env.FEE_CONSTRUCTOR),
      address: process.env.FEE_ADDRESS,
      source : getSourceCode('Fee'),
    };
    let Stake      = {
      values : JSON.parse(process.env.STAKE_CONSTRUCTOR),
      address: process.env.STAKE_ADDRESS,
      source : getSourceCode('Stake'),
    };
    let maxGas     = process.env.MAX_GAS_PRICE - 0;
    return {network, Fee, Stake, maxGas, privateKey}
  }

  function affirmEnvVariables() {
    ["FEE_CONSTRUCTOR", "STAKE_CONSTRUCTOR", "NETWORK", "MAX_GAS_PRICE"]
      .forEach(envName => affirm(process.env[envName], `Environment variable ${envName} is missing`))
  }

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

  function getSourceCode(contractName) {
    return fs.readFileSync(path.join(__dirname, "..", `${contractName}.txt`)).toString()
  }

  return getConf()
})()