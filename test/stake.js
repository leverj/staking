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
  let user1 = accounts[1];
  let user2 = accounts[2];


  before(async function () {
    token = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
    await token.transfer(user1, 100);
    await token.transfer(user2, 200);
    stake = await Stake.deployed();
    await stake.setBlocks(100, 300);
    await token.transfer(stake.address, 1000);
    await stake.setToken(token.address);
    await forceMine(new BN(200))
  });

  it('user should be able to put tokens for stake', async function () {
    stake = await Stake.deployed();
    await stakeit(10, user1, stake, token);
    await stakeit(15, user2, stake, token);
    await forceMine(new BN(250));
    await stakeit(15, user1, stake, token);
    await stakeit(20, user2, stake, token);
    expect(await balance(user1, token)).to.be.eql(75);
    expect(await balance(user2, token)).to.be.eql(165);
    expect(await balance(stake.address, token)).to.be.eql(1060);
    expect((await stake.totalLevs()).toNumber()).to.be.eql(60);
    expect((await stake.totalLevBlocks()).toNumber()).to.be.eql(10 * 98 + 15 * 48 + 15 * 96 + 20 * 46);
    expect((await stake.getStakes(user1)).toNumber()).to.be.eql(25);
    expect((await stake.getStakes(user2)).toNumber()).to.be.eql(35);
    expect((await stake.getLevBlocks(user1)).toNumber()).to.be.eql(10 * 98 + 15 * 48);
    expect((await stake.getLevBlocks(user2)).toNumber()).to.be.eql(15 * 96 + 20 * 46);
  });
});

contract('Calculate Fee Tokens', (accounts) => {
  let token, stake, fee;
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user3 = accounts[3];


  before(async function () {
    [stake, fee, token] = await setup(accounts);
    await stake.setToken(token.address);
    await forceMine(new BN(200));
    await stakeit(10, user1, stake, token);
    await stakeit(15, user2, stake, token);
    await forceMine(new BN(300));
    await sendFeesToSelf(stake.address, await stake.owner(), fee, 1000);
    await web3.eth.sendTransaction({from: user1, to: stake.address, value: 10000000});
  });


  it('Stake contract should be able to calculate total Fee Tokens based on trading', async function () {
    stake = await Stake.deployed();
    await stake.updateFeeForCurrentPeriod();
    expect((await stake.feeForThePeriod()).toNumber()).to.eql(1010);
  });
});


contract('Circulate Fee Tokens', (accounts) => {
  let token, stake, fee;
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user3 = accounts[3];


  before(async function () {
    [stake, fee, token] = await setup(accounts);
    await stakeit(10, user1, stake, token);
    await stakeit(15, user2, stake, token);
    await forceMine(new BN(300));
    await sendFeesToSelf(stake.address, await stake.owner(), fee, 1000);
    await web3.eth.sendTransaction({from: user1, to: stake.address, value: 10000000});
    await stake.updateFeeForCurrentPeriod();
  });


  it('Stake contract should be able to calculate total Fee Tokens based on trading', async function () {

  });
});


async function setup(accounts) {
  let user1 = accounts[1];
  let user2 = accounts[2];
  let user3 = accounts[3];
  let stake = await Stake.deployed();
  let fee = await Fee.deployed();
  await fee.setMinter(stake.address);
  await stake.setFeeToken(fee.address);
  let token = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
  // token = await HumanStandardToken.at(token.address);
  await token.transfer(user1, 100);
  await token.transfer(user2, 200);
  await stake.setBlocks(100, 300);
  await stake.setToken(token.address);
  await forceMine(new BN(200));
  return [stake, fee, token];
}

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
