const Web3   = require('web3')
const fs     = require('fs')
const path   = require('path')
const affirm = require('affirm.js')
const mkdirp = require('mkdirp')

module.exports = (function util() {
  const util = {}
  let deployer, gasPrice, web3;

  util.getDeployer = function () {
    return deployer
  }

  util.web3 = function () {
    return web3
  }

  util.getGasPrice = function () {
    return gasPrice
  }

  util.getOrCreateContract = async function getOrCreateContract(address, contractJson, values, source) {
    if (!address) {
      console.log(`Deploying ${contractJson.contractName} contract...`)
      const deployed = await deploy(contractJson, values, source);
      address        = deployed._address
    }
    let contract = new web3.eth.Contract(contractJson.abi, address);
    console.log(`${contractJson.contractName} address: `, address);
    return contract;
  }


  util.init = async function init(privateKey, network, maxGasPrice) {
    affirm(privateKey, 'private key is not set')
    affirm(network, 'network not set')
    affirm(maxGasPrice, 'maxGasPrice not set')
    web3 = new Web3(network);
    await createAccount(privateKey);
    await setGasPrice(maxGasPrice)
  }


  async function deploy(contractJson, arguments, source) {
    const contract   = new web3.eth.Contract(contractJson.abi);
    let tx           = contract.deploy({data: contractJson.bytecode, arguments: arguments});
    let deployed     = await util.sendTx(contract, tx);
    let contractName = contractJson.contractName;
    console.log({
      contractName,
      compileVersion: contractJson.compiler.version,
      constructor   : tx.encodeABI().substr(contractJson.bytecode.length),
      address       : deployed._address
    })
    await mkdirp(path.join(__dirname, '..', 'stage').toString())
    fs.writeFileSync(path.join(__dirname, '..', 'stage', `${contractName}.sol`), source, 'utf-8')
    return deployed
  }

  util.sendTx = async function sendTx(contract, tx) {
    contract.options.from = deployer.address;
    let gas               = await tx.estimateGas({from: deployer.address});
    console.log('gas', gas, gasPrice);
    return await tx.send({from: deployer.address, gas, gasPrice})
  }

  util.removeDeployerFromOwners = async function removeDeployerFromOwners(...contracts) {
    affirm(contracts && Array.isArray(contracts), 'Invalid contracts')
    for (let i = 0; i < contracts.length; i++) {
      let contract = contracts[i];
      let isOwner  = await contract.methods.isOwner(deployer.address).call()
      if (!isOwner) continue
      console.log(`Removing the owner in ${contract._address}...`);
      await util.sendTx(contract, contract.methods.removeOwner(deployer.address))
    }
  }

  async function setGasPrice(maxGasPrice) {
    gasPrice = Number.parseInt(await web3.eth.getGasPrice())
    printGasPrice()
    gasPrice = Math.min(gasPrice, maxGasPrice);
    printGasPrice()
  }

  async function createAccount(privateKey) {
    deployer = await web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(deployer);
    console.log('deployer', deployer.address)
  }

  function printGasPrice() {
    console.log('gas price', web3.utils.fromWei(web3.utils.toBN(gasPrice), 'gwei'), 'gwei')
  }

  return util
})()

