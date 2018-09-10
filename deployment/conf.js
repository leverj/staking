const fs = require('fs');
const path = require('path')
const affirm = require('affirm.js')

module.exports = (function () {
  function getConf() {
    affirmEnvVariables()
    let version = process.env.npm_package_version
    return {
      network: process.env.NETWORK,
      maxGasPrice: process.env.MAX_GAS_PRICE - 0,
      privateKey: getPrivateKey(),
      Fee: {
        values: JSON.parse(process.env.FEE_CONSTRUCTOR),
        address: process.env.FEE_ADDRESS,
        source: getSourceCode('Fee'),
      },
      Stake: {
        values: JSON.parse(process.env.STAKE_CONSTRUCTOR).concat([version]),
        address: process.env.STAKE_ADDRESS,
        source: getSourceCode('Stake'),
      }
    }
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
    return fs.readFileSync(path.join(__dirname, "..", `${contractName}.sol`)).toString()
  }

  return getConf()
})()