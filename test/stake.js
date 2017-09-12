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

    let token1 = await HumanStandardToken.new(100000, "LEV",0,"LEV");
    token = await HumanStandardToken.at(token1.address);
    await token1.transfer(user1, 100);
    let stake = await Stake.deployed();
    await token1.transfer(stake.address, 1000);
    await stake.setToken(token.address);
    console.log("token",token.address, await stake.tokenid());
    console.log(await token.balanceOf(user1), await token1.balanceOf(user1), await token.balanceOf(stake.address));
  });

  it('user should be able to put tokens for stake', async function(){
    let stake = await Stake.deployed();
    await stake.stakeTokens(10, { from: user1 });
    // await token.transfer(stake.address, 10, {from: user1});
    console.log(await token.balanceOf(user1), await token.balanceOf(stake.address));
  })



});