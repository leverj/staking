const chai = require('chai')
const Web3 = require("web3");
const config = require('config');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const stakeABI = require('./../build/contracts/Stake.json');
const testrpc = require('./../testrpc.js')
const App = require('./stakeAutomation.js')
let app

describe('App', () => {
	before(async () => {
		testrpc.start()
		app = new App()
	})

	it('should create the operator from the private key', async () => {

	})
})
