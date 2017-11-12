const Fee = artifacts.require('./Fee.sol')
const expect = require('expect.js')
const fs = require('fs')
const BN = require('bn.js')
const HttpProvider = require('ethjs-provider-http')
const EthRPC = require('ethjs-rpc')
const EthQuery = require('ethjs-query')
const Web3 = require('web3')
const ethRPC = new EthRPC(new HttpProvider('http://localhost:8545'))
const ethQuery = new EthQuery(new HttpProvider('http://localhost:8545'))
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

contract('generate and send fee', (accounts) => {
  let fee
  let minter = accounts[4]
  let user1 = accounts[1]
  let user2 = accounts[2]
  let user3 = accounts[3]
  before(async function () {
    fee = await Fee.deployed()
    await fee.setMinter(minter)
  })
  it('minter should be able to send fee', async function () {
    await fee.sendTokens(user1, 1000, {from: minter})
    await fee.sendTokens(user2, 1100, {from: minter})
    expect((await fee.balanceOf(user1)).toNumber()).to.eql(1000)
    expect((await fee.balanceOf(user2)).toNumber()).to.eql(1100)
    expect((await fee.feeInCirculation()).toNumber()).to.eql(2100)
  })

  it('should fail if user is not a minter', async function () {
    try {
      await fee.sendTokens(user1, 1000)
      expect().fail()
    } catch (e) {

    }
    try {
      await fee.sendTokens(user1, 1000, {from: user3})
      expect().fail()
    } catch (e) {
    }
  })

})

contract('burn tokens', (accounts) => {
  let fee
  let minter = accounts[4]
  let user1 = accounts[1]
  let user2 = accounts[2]
  before(async function () {
    fee = await Fee.deployed()
    await fee.setMinter(minter)
    await fee.sendTokens(user1, 1000, {from: minter})
    await fee.sendTokens(user2, 1100, {from: minter})
  })
  it('should be able to burn tokens', async function () {
    await fee.burnTokens(100, {from: user1})
    await fee.burnTokens(500, {from: user2})
    expect((await fee.balanceOf(user1)).toNumber()).to.eql(900)
    expect((await fee.balanceOf(user2)).toNumber()).to.eql(600)
    expect((await fee.feeInCirculation()).toNumber()).to.eql(1500)
  })

})
