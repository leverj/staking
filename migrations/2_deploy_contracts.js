const Stake = artifacts.require("./Stake.sol")
const Fee = artifacts.require("./Fee.sol")
const stakeConf = require('../conf/stake.json')
const feeConf = require('../conf/fee.json')

module.exports = async function (deployer) {
  await deployer.deploy([
    [Fee, feeConf.owner, feeConf.tokenName, feeConf.decimalUnits, feeConf.tokenSymbol],
    [Stake, stakeConf.owner, stakeConf.wallet, stakeConf.weiPerFee, stakeConf.levid]
  ])
  const stake = await Stake.deployed()
  const fee = await Fee.deployed()
  // await fee.setMinter(stake.address, {from: feeConf.owner})
  await stake.setFeeToken(fee.address, {from: stakeConf.owner})
}
