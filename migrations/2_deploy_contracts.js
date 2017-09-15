const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");
const stakeConf = require('../conf/stake.json');
const feeConf = require('../conf/fee.json');

module.exports = async function (deployer) {
  try {
    await deployer.deploy([
      [Fee, feeConf.owner, feeConf.tokenName, feeConf.decimalUnits, feeConf.tokenSymbol],
      [Stake, stakeConf.owner, stakeConf.levid, stakeConf.freezeBlock]]);
    let stake = await Stake.deployed();
    let fee = await Fee.deployed();
    await fee.setMinter(stake.address);
    await stake.setFeeToken(fee.address);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
