const Web3 = require("web3");
const config = require('config');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const stakeABI = require('./../build/contracts/Stake.json');

// done - calculate Fee tokens after endBlock
// done - automatically set next staking interval
// redeem lev and fee tokens for users
class App {
	constructor () {
		this.init()
	}

	async init() {
		this.operator = await web3.eth.accounts.privateKeyToAccount(
			process.env.OPERATOR_KEY || process.argv[2]);
		this.stake = new web3.eth.Contract(stakeABI, config.stake);
	}

	// To calculate the new Fee price depending on the state of the Smart Contract
	async updateFeeForCurrentStakingInterval() {
		await this.stake.methods.updateFeeForCurrentStakingInterval().sendTransaction({
			from: this.operator.address
		})
	}

	// This will execute the function `redeemLevAndFeeToStakers` from the stake
	// contract once the block.timestamp is bigger or equal the current block must
	// be executed after that manually
	async redeemLevAndFeeToStakers() {
		let stakers = await this.stake.methods.stakers().call()
		await this.stake.methods.redeemLevAndFeeToStakers(stakers).sendTransaction({
			from: this.operator.address
		})
	}

	// This will start a new staking interval automatically made of 100,000 blocks
	async startNewStakingInterval(blockSize) {
		let start = (await web3.eth.getBlock('latest')).number
		let end = this.currentBlock + blockSize
		await this.stake.methods.startNewStakingInterval(start, end).sendTransaction({
			from: this.operator.address
		})
	}
}

new App()

module.exports = App
