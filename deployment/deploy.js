const Web3 = require('web3');
const key = require('./conf').key;
const configuration = require('./conf').configuration;
const web3 = new Web3(new Web3.providers.HttpProvider(configuration.network));
const feeJson = require('./../build/contracts/Fee.json');
const stakeJson = require('./../build/contracts/Stake.json');
const _ = require('lodash')
let fee;
let stake;
let deployer;
let sendOptions;

async function startAutomation() {
	async function init() {
		await createAccount();
		await deployContracts();
	}

	async function createAccount() {
		deployer = await web3.eth.accounts.privateKeyToAccount(key);
		web3.eth.accounts.wallet.add(deployer);
		sendOptions = {from: deployer.address, gas: 4e6, gasPrice: 61e9}
	}

	function printConstructor(name, conf){
    let abi = web3.eth.abi.encodeParameters(conf.parameters.types, conf.parameters.values)
    console.log(name, abi);
  }
	async function deployContracts() {
    printConstructor("FEE", configuration.fee)
    printConstructor("STAKE", configuration.stake)
	  console.log(`deployer address: ${deployer.address}`);
    fee = await getOrCreateContract('FEE', configuration.feeAddress, feeJson, configuration.fee.parameters.values);
    console.log(`FEE address: `, fee._address);
    stake = await getOrCreateContract('STAKE', configuration.stakeAddress, stakeJson, configuration.stake.parameters.values);
    console.log(`STAKE address: `, stake._address);

    fee.options.from = deployer.address
		stake.options.from = deployer.address

		console.log('Setting the fee token in Stake.sol...');
		await stake.methods.setFeeToken(fee._address).send({from: deployer.address, gas: 4e6, gasPrice: 61e9});
		console.log('Setting the minter in Fee.sol...');
		await fee.methods.setMinter(stake._address).send({from: deployer.address, gas: 4e6, gasPrice: 61e9});
		console.log('Removing the admin in Fee.sol...');
		await fee.methods.removeOwner(deployer.address).send({from: deployer.address, gas: 4e6, gasPrice: 61e9});
		console.log('Removing the admin in Stake.sol...');
		await stake.methods.removeOwner(deployer.address).send({from: deployer.address, gas: 4e6, gasPrice: 61e9});
		console.log('Done');
	}

	async function getOrCreateContract(name , address, contractJson, values ){
    let deployed;
    if(!address) {
      console.log(`Deploying ${name} contract...`)
      const contract = await deploy(contractJson.abi, contractJson.bytecode, addDeployerToAdmin(values));
      // configuration.feeAddress = contract.contractAddress;
      deployed = new web3.eth.Contract(contractJson.abi, contract.contractAddress, sendOptions);
      // updateConfiguration = true;
    } else {
      // Create the instance of the contract with configuration.feeAddress
      deployed = new web3.eth.Contract(contractJson.abi, address, sendOptions);
    }
    return deployed;
	}

	function addDeployerToAdmin(values){
		let valuesCopy = _.cloneDeep(values)
		valuesCopy[0].push(deployer.address);
		return valuesCopy;
	}

	async function deploy(abi, bytecode, parameters) {
		await createAccount()
		const contract = new web3.eth.Contract(abi)
    let tx = contract.deploy({data: bytecode, arguments: parameters})
    // console.log('bytecode', tx.encodeABI())
    return await tx.send(sendOptions);
	}

	await init()
}

startAutomation().catch(console.error);
