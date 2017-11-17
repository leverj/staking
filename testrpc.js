const testrpc = require('ethereumjs-testrpc')
const hdkey = require('ethereumjs-wallet/hdkey');
const bip39 = require('bip39');
const ACCOUNTFUNDING = '0x33B2E3C9FD0804000000000'; // One billion Ether in Wei
const HDPATH = 'm/44\'/60\'/0\'/0/';
const mnemonic = "economy chuckle twin square rose provide friend combine fashion wheel purse huge"
let accounts = [];

function generateAccounts(mnemonic, hdPathIndex, totalToGenerate, accumulatedAddrs) {
  const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(mnemonic));
  const node = hdwallet.derivePath(HDPATH + hdPathIndex.toString());
  let wallet = node.getWallet();
  const secretKey = wallet.getPrivateKeyString();
  const address = wallet.getAddressString();
  accumulatedAddrs.push({
		secretKey,
		address,
		balance: ACCOUNTFUNDING,
	});

  const nextHDPathIndex = hdPathIndex + 1;
  if (nextHDPathIndex === totalToGenerate) {
    return accumulatedAddrs;
  }

  return generateAccounts(mnemonic, nextHDPathIndex, totalToGenerate, accumulatedAddrs);
}

function start() {
	accounts = generateAccounts(mnemonic, 0, 100, [])
	const testRPCInput = {
		accounts,
		locked: false
	};
	testrpc.server(testRPCInput).listen(8545);
}

function stop() {

}

module.exports = {
	start,
	stop,
	account: function(index){
		return accounts[index];
	}
}
