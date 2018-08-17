const Fee = artifacts.require('./Fee.sol');
const expect = require('expect.js');

contract('generate and send fee', ([admin, user1,user2,user3, minter]) => {
  let fee;
  before(async function () {
    fee = await Fee.new([admin], "Leverj FEE Token", "0", "FEE" );
    await fee.setMinter(minter)
  });
  it('minter should be able to send fee', async function () {
    await fee.sendTokens(user1, 1000, {from: minter});
    await fee.sendTokens(user2, 1100, {from: minter});
    expect((await fee.balanceOf(user1)).toNumber()).to.eql(1000);
    expect((await fee.balanceOf(user2)).toNumber()).to.eql(1100);
    expect((await fee.totalSupply()).toNumber()).to.eql(2100)
  });

  it('should fail if user is not a minter', async function () {
    try {
      await fee.sendTokens(user1, 1000);
      expect().fail()
    } catch (e) {

    }
    try {
      await fee.sendTokens(user1, 1000, {from: user3});
      expect().fail()
    } catch (e) {
    }
  })

});

contract('burn tokens', ([admin, user1,user2,user3, minter]) => {
  let fee;
  before(async function () {
    fee = await Fee.new([admin], "Leverj FEE Token", "0", "FEE" );
    await fee.setMinter(minter);
    await fee.sendTokens(user1, 1000, {from: minter});
    await fee.sendTokens(user2, 1100, {from: minter})
  });
  it('should be able to burn tokens', async function () {
    await fee.burnTokens(100, {from: user1});
    await fee.burnTokens(500, {from: user2});
    expect((await fee.balanceOf(user1)).toNumber()).to.eql(900);
    expect((await fee.balanceOf(user2)).toNumber()).to.eql(600);
    expect((await fee.totalSupply()).toNumber()).to.eql(1500)
  })

});
