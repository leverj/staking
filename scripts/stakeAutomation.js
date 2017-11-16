const Web3 = require("web3");
// const web3 = new Web3(new Web3.providers.HttpProvider('https://mainnet.infura.io'));
const web3 = new Web3();


async function generateOperatorKey(){
  let key = await web3.eth.accounts.create();
  console.log(JSON.stringify(key));
}


async function setupStake(){

}