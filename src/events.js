const Web3 = require("web3");
const providers = require("./providers");
const util = require("./util");

async function events() {
	try {
		let compiled = util.compile("../token-contracts/contracts");
		let tokenAbi = compiled.contracts["Token.sol:Token"].interface;
		let web3 = new Web3(providers.socket.ropsten);
		let contract = new web3.eth.Contract(JSON.parse(tokenAbi), '0xa26fe93339345c40dd1904a700c15d02352c2b0b');
		await contract.getPastEvents('Transfer');
		
		console.log("subscribing");

		contract.events.Transfer({fromBlock: 0, toBlock: 'latest'}, (error, result) => {
			if (error) {
				console.error("error", error);
			}
			console.log("messages", result.event, result.returnValues);
		});
	} catch (e) {
		console.log(e);
	}
}

events();
