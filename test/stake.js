const HumanStandardToken = artifacts.require("./HumanStandardToken.sol");
const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");

const expect = require("expect.js");
const fs = require('fs');
const BN = require('bn.js');
const HttpProvider = require('ethjs-provider-http');
const EthRPC = require('ethjs-rpc');
const EthQuery = require('ethjs-query');
const Web3 = require('web3');


const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'));
const ethQuery = new EthQuery(new HttpProvider('http://localhost:8545'));
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

contract('Stake Levs', (accounts) => {
  let token, stake;

  before(async function () {
    token = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
    await token.transfer(user1(accounts), 100);
    await token.transfer(user2(accounts), 200);
    stake = await Stake.deployed();
    await stake.startNewStakingInterval(100, 300, {from: operator(accounts)});
    await token.transfer(stake.address, 1000);
    await stake.setLevToken(token.address);
    await forceMine(new BN(200))
  });

  it('user should be able to put tokens for stake', async function () {
    stake = await Stake.deployed();
    await stakeit(10, user1(accounts), stake, token);
    await stakeit(15, user2(accounts), stake, token);
    await forceMine(new BN(250));
    await stakeit(15, user1(accounts), stake, token);
    await stakeit(20, user2(accounts), stake, token);
    expect(await balance(user1(accounts), token)).to.be.eql(75);
    expect(await balance(user2(accounts), token)).to.be.eql(165);
    expect(await balance(stake.address, token)).to.be.eql(1060);
    expect((await stake.totalLevs()).toNumber()).to.be.eql(60);
    expect((await stake.totalLevBlocks()).toNumber()).to.be.eql(10 * 98 + 15 * 48 + 15 * 96 + 20 * 46);
    expect((await stake.stakes(user1(accounts))).toNumber()).to.be.eql(25);
    expect((await stake.stakes(user2(accounts))).toNumber()).to.be.eql(35);
    expect((await stake.levBlocks(user1(accounts))).toNumber()).to.be.eql(10 * 98 + 15 * 48);
    expect((await stake.levBlocks(user2(accounts))).toNumber()).to.be.eql(15 * 96 + 20 * 46);
  });
});

contract('Calculate Fee Tokens', (accounts) => {
  let token, stake, fee;
  let wallet;

  before(async function () {
    [stake, fee, token] = await setup(accounts);
    await stake.setLevToken(token.address);
    wallet = await stake.wallet();
    await web3.eth.sendTransaction({
      from: wallet,
      to: user3(accounts),
      value: new BN("999999999990000000000000000", 10)
    });
    await forceMine(new BN(200));
    await stakeit(10, user1(accounts), stake, token);
    await stakeit(15, user2(accounts), stake, token);
    await forceMine(new BN(300));
    await sendFeesToSelf(stake.address, await stake.owner(), fee, 1000);
    await web3.eth.sendTransaction({from: user1(accounts), to: stake.address, value: 10000000});
  });


  it('Stake contract should be able to calculate total Fee Tokens based on trading', async function () {
    let walletBalance = (await web3.eth.getBalance(wallet));
    stake = await Stake.deployed();
    await stake.updateFeeForCurrentStakingInterval({from: operator(accounts)});
    expect((await stake.feeForTheStakingInterval()).toNumber()).to.eql(1010);
    expect((await fee.balanceOf(stake.address)).toNumber()).to.eql(0);
    let walletNewBalance = (await web3.eth.getBalance(wallet));
    expect(walletNewBalance - walletBalance).to.eql(10000000);
  });
});


contract('Circulate Fee Tokens', (accounts) => {
  let token, stake, fee;

  before(async function () {
    [stake, fee, token] = await setup(accounts);
    await stakeit(10, user1(accounts), stake, token);
    await stakeit(15, user2(accounts), stake, token);
    await forceMine(new BN(300));
    await sendFeesToSelf(stake.address, await stake.owner(), fee, 1000);
    await web3.eth.sendTransaction({from: user1(accounts), to: stake.address, value: 10000000});
    await stake.updateFeeForCurrentStakingInterval({from: operator(accounts)});
  });


  it('Stake contract should be able to send Fee and Lev to User', async function () {
    await stake.redeemLevAndFeeByStaker({from: user1(accounts)});
    expect((await token.balanceOf(user1(accounts))).toNumber()).to.eql(100);
    expect((await fee.balanceOf(user1(accounts))).toNumber()).to.eql(409);
    expect((await stake.stakes(user1(accounts))).toNumber()).to.eql(0);
    expect((await stake.levBlocks(user1(accounts))).toNumber()).to.eql(0);
    expect((await stake.totalLevs()).toNumber()).to.eql(15);
  });
});


contract('Stake setup', (accounts) => {
  let token, stake, fee;

  before(async function () {
    [stake, fee, token] = await setup(accounts);
    await stake.setLevToken(token.address);
    await forceMine(new BN(200));
    await stakeit(10, user1(accounts), stake, token);
    await stakeit(15, user2(accounts), stake, token);
    await forceMine(new BN(300));
    await sendFeesToSelf(stake.address, await stake.owner(), fee, 1000);
    await web3.eth.sendTransaction({from: user1(accounts), to: stake.address, value: 10000000});
  });

  it('should fail to reset if there are stakes left', async function () {
    try {
      await stake.startNewStakingInterval(1000, 2000, {from: operator(accounts)});
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.not.eql("should not pass")
    }
  });

  it('should reset after all the stakes have been returned', async function () {
    await stake.updateFeeForCurrentStakingInterval({from: operator(accounts)});
    await stake.redeemLevAndFeeToStakers([user1(accounts), user2(accounts)], {from: operator(accounts)});
    await stake.startNewStakingInterval(1000, 2000, {from: operator(accounts)});
    expect((await stake.startBlock()).toNumber()).to.eql(1000);
    expect((await stake.endBlock()).toNumber()).to.eql(2000);
    expect((await stake.totalLevBlocks()).toNumber()).to.eql(0);
    expect((await stake.feeForTheStakingInterval()).toNumber()).to.eql(0);
    expect((await stake.feeCalculated())).to.eql(false);
  })
});


async function stakeit(count, user, stake, token) {
  await token.approve(stake.address, count, {from: user});
  await stake.stakeTokens(count, {from: user});
}

function forceMine(blockToMine) {
  return new Promise(async (resolve, reject) => {
    if (!BN.isBN(blockToMine)) {
      reject('Supplied block number must be a BN.');
    }
    const blockNumber = await ethQuery.blockNumber();
    if (blockNumber.lt(blockToMine)) {
      ethRPC.sendAsync({method: 'evm_mine'}, (err) => {
        if (err !== undefined && err !== null) {
          reject(err);
        }
        resolve(forceMine(blockToMine));
      });
    } else {
      resolve();
    }
  });
}


async function balance(address, token) {
  return (await token.balanceOf(address)).toNumber();
}

async function sendFeesToSelf(_to, _owner, _fee, _qty) {
  let minter = await _fee.minter();
  await _fee.setMinter(_owner, {from: _owner});
  await _fee.sendTokens(_to, _qty, {from: _owner});
  await _fee.setMinter(minter, {from: _owner});
}

async function setup(accounts) {
  let stake = await Stake.deployed();
  let fee = await Fee.deployed();
  await fee.setMinter(stake.address);
  await stake.setFeeToken(fee.address);
  let token = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
  // token = await HumanStandardToken.at(token.address);
  await token.transfer(user1(accounts), 100);
  await token.transfer(user2(accounts), 200);
  await stake.startNewStakingInterval(100, 300, {from: operator(accounts)});
  await stake.setLevToken(token.address);
  await forceMine(new BN(200));
  return [stake, fee, token];
}


function user1(accounts) {
  return accounts[1]
}

function user2(accounts) {
  return accounts[2]
}

function user3(accounts) {
  return accounts[3]
}

function operator(accounts) {
  return accounts[6]
}