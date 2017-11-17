const chai = require('chai')
const Web3 = require("web3");
const config = require('config');
const conf = require('./../conf/stake.json')
const mock = require('mock-require')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const stakeABI = require('./../build/contracts/Stake.json');
const testrpc = require('./../testrpc.js')
const App = require('./stakeAutomation.js')
let app

describe('App', () => {
	before(async () => {
		testrpc.start()
		const contract = new web3.eth.Contract(stakeABI.abi);
		const stake = await contract.deploy({
			data: stakeABI.bytecode,
			arguments: [
				"0xa2ed424d3588e5c10988a30b8a9d5085d1608b69",
				"0xbc91b8f2e82c9b54eb7445d2d28d4978f278b557",
				"0xaa653b7e0fc2fbd01391779bee8b637447d8264f",
				"1000000",
				"0x8091adff56526626a4def7803368f057e70c7959"
			]
		}).send({
	    from: testrpc.account(0).address,
	    gas: 4e6,
	    gasPrice: '30000000000000'
		})
		console.log(stake._address)
		// app = new App()
		// mock('config', {
		//   "common": {
		//     "network": "http://localhost:8545",
		//     "stake": stake.address,
		//     "fee": "0xc67b93fb52d11e378ac0a923d4f4d7e4138238f7",
		//     "lev": "0xaa7127e250e87476fdd253f15e86a4ea9c4c4bd4"
		//   },
		//   "ip": "0.0.0.0",
		//   "port": "8888"
		// })
	})

	it('should create the operator from the private key', async () => {
	})
})
