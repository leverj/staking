const Web3      = require('web3')
const config    = require('./conf')
const feeJson   = require('../build/contracts/Fee.json')
const stakeJson = require('../build/contracts/Stake.json')
const _         = require('lodash')
const fs        = require('fs')
const path      = require('path')

async function deploy() {
  let fee, stake, deployer, web3, gasPrice;

  async function start() {
    web3 = new Web3(new Web3.providers.HttpProvider(config.network));
    await createAccount();
    gasPrice = Number.parseInt(await web3.eth.getGasPrice())
    printGasPrice()
    gasPrice = Math.min(gasPrice, config.maxGas);
    printGasPrice()
    await createContracts();
    await provision();
    await removeDeployer();
    console.log('Done');
  }

  async function provision() {
    console.log('Setting the fee token in Stake.sol...');
    await sendTx(stake, stake.methods.setFeeToken(fee._address));
    console.log('Setting the minter in Fee.sol...');
    await sendTx(fee, fee.methods.setMinter(stake._address));
  }

  async function removeDeployer() {
    console.log('Removing the admin in Fee.sol...');
    await sendTx(fee, fee.methods.removeOwner(deployer.address));
    console.log('Removing the admin in Stake.sol...');
    await sendTx(stake, stake.methods.removeOwner(deployer.address));
  }

  async function createAccount() {
    deployer = await web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(deployer);
    console.log('deployer', deployer.address)
  }

  async function createContracts() {
    fee   = await getOrCreateContract(config.Fee.address, feeJson, config.Fee.values);
    stake = await getOrCreateContract(config.Stake.address, stakeJson, config.Stake.values);
  }

  async function getOrCreateContract(address, contractJson, values) {
    if (!address) {
      console.log(`Deploying ${contractJson.contractName} contract...`)
      const deployed = await deploy(contractJson, addDeployerToAdmin(values));
      address        = deployed._address
    }
    let contract = new web3.eth.Contract(contractJson.abi, address);
    console.log(`${contractJson.contractName} address: `, address);
    return contract;
  }

  //todo: first entry in values is assumed as admin list
  function addDeployerToAdmin(values) {
    let valuesCopy = _.cloneDeep(values)
    valuesCopy[0].push(deployer.address);
    return valuesCopy;
  }


  async function deploy(contractJson, arguments) {
    const contract   = new web3.eth.Contract(contractJson.abi);
    let tx           = contract.deploy({data: contractJson.bytecode, arguments: arguments});
    let deployed     = await sendTx(contract, tx);
    let contractName = contractJson.contractName;
    console.log({
      contractName,
      compileVersion: contractJson.compiler.version,
      constructor   : tx.encodeABI().substr(contractJson.bytecode.length),
      address       : deployed._address
    })
    fs.writeFileSync(path.join(__dirname, '..', 'src', `${contractName}.txt`), config[contractName].source, 'utf-8')
    return deployed
  }

  async function sendTx(contract, tx) {
    contract.options.from = deployer.address;
    let gas               = await tx.estimateGas();
    console.log('gas', gas, gasPrice);
    return await tx.send({from: deployer.address, gas, gasPrice})
  }

  function printGasPrice() {
    console.log('gas price', web3.utils.fromWei(web3.utils.toBN(gasPrice), 'gwei'), 'gwei')
  }

  await start()
}

deploy().catch(console.error);
