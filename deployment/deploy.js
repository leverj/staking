const Web3      = require('web3');
const config    = require('./conf');
const feeJson   = require('../build/contracts/Fee.json');
const stakeJson = require('../build/contracts/Stake.json');
const _         = require('lodash')

async function deploy() {
  let fee, stake, deployer, web3, gasPrice;

  async function start() {
    web3 = new Web3(new Web3.providers.HttpProvider(config.network));
    await createAccount();
    gasPrice = (await web3.eth.getGasPrice()) - 0;
    printGasPrice()
    gasPrice = Math.min(gasPrice, config.maxGas);
    printGasPrice()
    await createContracts();
    await provision();
    console.log('Done');
  }

  async function provision(){
    console.log('Setting the fee token in Stake.sol...');
    await sendTx(stake, stake.methods.setFeeToken(fee._address));
    console.log('Setting the minter in Fee.sol...');
    await sendTx(fee, fee.methods.setMinter(stake._address));
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
    fee   = await getOrCreateContract(config.fee.address, feeJson, config.fee.values);
    stake = await getOrCreateContract(config.stake.address, stakeJson, config.stake.values);

  }

  async function getOrCreateContract(address, contractJson, values) {
    if (!address) {
      console.log(`Deploying ${contractJson.contractName} contract...`)
      const contract = await deploy(contractJson, addDeployerToAdmin(values));
      address        = contract._address
    }
    let deployed = new web3.eth.Contract(contractJson.abi, address);
    console.log(`${contractJson.contractName} address: `, address);
    return deployed;
  }

  //todo: first entry in values is assumed as admin list
  function addDeployerToAdmin(values) {
    let valuesCopy = _.cloneDeep(values)
    valuesCopy[0].push(deployer.address);
    return valuesCopy;
  }


  async function deploy(contractJson, arguments) {
    const contract = new web3.eth.Contract(contractJson.abi);
    let tx         = contract.deploy({data: contractJson.bytecode, arguments: arguments});
    console.log({
      contractName  : contractJson.contractName,
      compileVersion: contractJson.compiler.version,
      constructor   : tx.encodeABI().substr(contractJson.bytecode.length),
    })
    return await sendTx(contract, tx)
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
