const Web3 = require('web3');
const key = require('./conf').key;
const configuration = require('./conf').configuration;
const fs = require('fs');
const path = require('path');
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
		sendOptions = {from: deployer.address, gas: 4e6}
	}

	async function deployContracts() {
		let updateConfiguration = false;

		if(configuration.feeAddress === 'undefined') {
			console.log('Deploying fee contract...')
			const feeContract = await deploy(feeJson.abi, feeJson.bytecode, addDeployerToAdmin(configuration.fee.parameters.values));
			configuration.feeAddress = feeContract.contractAddress;
			fee = new web3.eth.Contract(feeJson.abi, feeContract.contractAddress, sendOptions);
			updateConfiguration = true;
		} else {
			// Create the instance of the contract with configuration.feeAddress
			fee = new web3.eth.Contract(feeJson.abi, configuration.feeAddress, sendOptions);
		}

		if(configuration.stakeAddress === 'undefined') {
			console.log('Deploying stake contract...')
			const stakeContract = await deploy(stakeJson.abi, stakeJson.bytecode, addDeployerToAdmin(configuration.stake.parameters.values));
			configuration.stakeAddress = stakeContract.contractAddress;
			stake = new web3.eth.Contract(stakeJson.abi, stakeContract.contractAddress);
			updateConfiguration = true;
		} else {
			// Create the instance of the contract with configuration.stakeAddress
			stake = new web3.eth.Contract(stakeJson.abi, configuration.stakeAddress);
		}

		fee.options.from = deployer.address
		stake.options.from = deployer.address

		if(updateConfiguration) fs.writeFileSync(path.join(__dirname, 'configuration.json'), JSON.stringify(configuration));

		console.log('Setting the fee token in Stake.sol...');
		await stake.methods.setFeeToken(fee._address).send({from: deployer.address, gas: 4e6});
		console.log('Setting the minter in Fee.sol...');
		await fee.methods.setMinter(stake._address).send({from: deployer.address, gas: 4e6});
		console.log('Removing the admin in Fee.sol...');
		await fee.methods.removeOwner(deployer.address).send({from: deployer.address, gas: 4e6});
		console.log('Removing the admin in Stake.sol...');
		await stake.methods.removeOwner(deployer.address).send({from: deployer.address, gas: 4e6});
		console.log('Done');
	}

	function addDeployerToAdmin(values){
		let valuesCopy = _.cloneDeep(values)
		valuesCopy[0].push(deployer.address);
		return valuesCopy;
	}

	async function deploy(abi, bytecode, parameters) {
		await createAccount()
		const contract = new web3.eth.Contract(abi);
		return await contract.deploy({data: bytecode, arguments: parameters}).send(sendOptions);
	}

	await init()
}

startAutomation().catch(console.error);
