const BN         = require('bn.js');
const EthRPC     = require('ethjs-rpc');
const Web3       = require('web3');
const customWeb3 = new Web3(web3.currentProvider)
const ethRPC     = new EthRPC(web3.currentProvider);
const util       = require('util')
const sendAsyncP = util.promisify(ethRPC.sendAsync.bind(ethRPC))
const mine       = async () => await sendAsyncP({method: 'evm_mine'})
const toNumber   = _ => Array.isArray(_) ? _.map(bn => bn.toNumber()) : _.toNumber()
const balance    = async (address, token) => token ? (await token.balanceOf(address)).toNumber() : await customWeb3.eth.getBalance(address);
const sendEth    = async (from, to, value) => await customWeb3.eth.sendTransaction({from, to, value: new BN(value, 10)})
const fromEth    = (eth) => new BN(customWeb3.utils.toWei(eth), 10)


async function stakeit(count, user, stake, token) {
  if (count > 0) await token.approve(stake.address, count, {from: user});
  await stake.stake(count, {from: user});
}

async function mineBlocks(blocks) {
  for (let i = 0; i < blocks; i++) {
    await mine()
  }
}

async function forceMine(blockToMine) {
  if (BN.isBN(blockToMine)) blockToMine = blockToMine.toNumber()
  const blockNumber = await customWeb3.eth.getBlockNumber().then(_ => parseInt(_, 10));
  if (blockNumber >= blockToMine) return
  await mineBlocks(blockToMine - blockNumber)
}

async function sendFeesToSelf(_to, _owner, _fee, _qty) {
  let minter = await _fee.minter();
  await _fee.setMinter(_owner, {from: _owner});
  await _fee.sendTokens(_to, _qty, {from: _owner});
  await _fee.setMinter(minter, {from: _owner});
}

module.exports = {forceMine, balance, fromEth, stakeit, sendFeesToSelf, sendEth, mineBlocks, mine, toNumber, customWeb3}