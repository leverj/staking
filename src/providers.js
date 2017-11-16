http: {
	ropsten: new Web3.providers.HttpProvider("http://51.15.134.155:8545"),
	rinkeby: new Web3.providers.HttpProvider("http://51.15.210.146:8545"),
	mainnet: new Web3.providers.HttpProvider("http://51.15.173.167:8545"),
	mainnet1: new Web3.providers.HttpProvider("http://51.15.191.108:8545"),
},
socket:{
	ropsten:new Web3.providers.WebsocketProvider("ws://51.15.134.155:8546"),
	rinkeby:new Web3.providers.WebsocketProvider("ws://51.15.210.146:8546"),
	mainnet:new Web3.providers.WebsocketProvider("ws://51.15.173.167:8546"),
	mainnet1:new Web3.providers.WebsocketProvider("ws://51.15.191.108:8546"),
},
infura:{
	ropsten:new Web3.providers.HttpProvider("https://ropsten.infura.io"),
	rinkeby:new Web3.providers.HttpProvider("https://rinkeby.infura.io"),
	mainnet:new Web3.providers.HttpProvider("https://mainnet.infura.io"),
}
