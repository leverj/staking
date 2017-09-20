const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");
const stakeConf = require('../conf/stake.json');
const feeConf = require('../conf/fee.json');
const debug = require('../lib').Debug(__filename);

module.exports = async function (deployer) {
  try {
    await deployer.deploy([
      [Fee, feeConf.owner, feeConf.tokenName, feeConf.decimalUnits, feeConf.tokenSymbol],
      [Stake, stakeConf.owner, stakeConf.wallet, stakeConf.weiPerFee, stakeConf.levid, stakeConf.freezeBlock]]);
    let stake = await Stake.deployed();
    let fee = await Fee.deployed();
    await fee.setMinter(stake.address);
    await stake.setFeeToken(fee.address);
    debug("deployed Stake and Fee");
  } catch (e) {
    debug(e);
    process.exit(1);
  }
};
