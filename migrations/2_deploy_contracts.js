const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");
const stakeConf = require('../conf/stake.json');
const feeConf = require('../conf/fee.json');
const debug = require('../lib').Debug(__filename);

module.exports = async function (deployer) {
  try {
    console.log('Starting deployment');
    await deployer.deploy([
      [Fee, feeConf.owner, feeConf.tokenName, feeConf.decimalUnits, feeConf.tokenSymbol],
      [Stake, stakeConf.owner, stakeConf.wallet, stakeConf.weiPerFee, stakeConf.levid]
    ]);
    let stake = await Stake.deployed();
    let fee = await Fee.deployed();
    console.log('done deployment');
  } catch (e) {
    debug(e);
    process.exit(1)
  }
};
