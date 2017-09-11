const HumanStandardToken = artifacts.require("./HumanStandardToken.sol");
const Stake = artifacts.require("./Stake.sol");

const fs = require('fs');
const BN = require('bn.js');
const HttpProvider = require('ethjs-provider-http');
const EthRPC = require('ethjs-rpc');
const EthQuery = require('ethjs-query');

const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'));
const ethQuery = new EthQuery(new HttpProvider('http://localhost:8545'));


contract('Stake', (accounts)=>{
  let token;
  let user1 = accounts[1];
  let user2 = accounts[2];

  before(async function(){
    token = await HumanStandardToken.new(100000, "LEV",0,"LEV");
    token.transfer(user1, 100);
    let stake = await Stake.deployed();
    console.log("token", typeof token.address)
    await stake.setToken(token.address)
  });

  it('user should be able to put tokens for stake', async function(){
    let stake = await Stake.deployed();
    await stake.transfer.call(stake.address, 10, { from: user1 });
    console.log(await token.balanceOf(user1))

  })



})