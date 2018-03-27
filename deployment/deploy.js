const config         = require('./conf')
const feeJson        = require('../build/contracts/Fee.json')
const stakeJson      = require('../build/contracts/Stake.json')
const _              = require('lodash')
const deploymentUtil = require('./deploymentUtil')
const migration      = require('./migrateFeeTokens')

async function deploy() {
  let fee, stake, deployer;

  async function start() {
    await deploymentUtil.init(config.privateKey, config.network, config.maxGasPrice)
    deployer = deploymentUtil.getDeployer()
    await createContracts();
    await migration().migrate(process.env.PREVIOUS_FEE_ADDRESS, fee._address, feeJson.abi, deploymentUtil);
    await provision();
    await deploymentUtil.removeDeployerFromOwners(stake, fee);
    console.log('Done');
  }

  async function provision() {
    console.log('Setting the fee token in Stake.sol...');
    await deploymentUtil.sendTx(stake, stake.methods.setFeeToken(fee._address));
    console.log('Setting the minter in Fee.sol...');
    await deploymentUtil.sendTx(fee, fee.methods.setMinter(stake._address));
  }

  async function createContracts() {
    fee   = await deploymentUtil.getOrCreateContract(config.Fee.address, feeJson, addDeployerToAdmin(config.Fee.values), config.Fee.source);
    stake = await deploymentUtil.getOrCreateContract(config.Stake.address, stakeJson, addDeployerToAdmin(config.Stake.values), config.Stake.source);
  }

  function addDeployerToAdmin(values) {
    let valuesCopy = _.cloneDeep(values)
    valuesCopy[0].push(deployer.address);
    return valuesCopy;
  }

  await start()
}

deploy().catch(console.error);
