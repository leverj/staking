const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");
const stakeConf = require('../conf/stake.json');
const feeConf = require('../conf/fee.json');

module.exports = async function (deployer) {
  await deployer.deploy([
    [Fee, feeConf.owners, feeConf.tokenName, feeConf.decimalUnits, feeConf.tokenSymbol],
    [Stake, stakeConf.owners, stakeConf.operator, stakeConf.wallet, stakeConf.weiPerFee, stakeConf.levid]
  ]);
};
