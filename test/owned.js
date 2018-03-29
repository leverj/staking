const Fee = artifacts.require('./Fee.sol');
const expect = require('expect.js');


contract('owner manipulations', (accounts) => {
  let fee;
  before(async function () {
    fee = await Fee.new(owners(accounts), 'FEE', 9, 'FEE');
  });

  it('should have all the owners', async function () {
    let _owners = owners(accounts);
    expect(await fee.getOwners()).to.eql(_owners);
    for (let i = 0; i < _owners.length; i++) {
      expect(await fee.isOwner(_owners[i])).to.eql(true);
    }
  });

  it('non-owner should not be able to add new owner', async function () {
    try {
      await fee.addOwner(accounts[4], {from: accounts[4]});
      throw new Error('did not fail');
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
  });

  it('non-owner should not be able to set the operator', async function () {
    try {
      await fee.setOperator(accounts[4], {from: accounts[4]});
      throw new Error('did not fail');
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
  });

  it('any owner can set the operator', async function () {
    expect(await fee.operator.call()).to.eql(0);
    await fee.setOperator(accounts[1], { from: accounts[0] });
    expect(await fee.operator.call()).to.eql(accounts[1]);
  });

  it('any owner can add a new owner', async function () {
    let _owners = owners(accounts).concat(accounts[4]);
    await fee.addOwner(accounts[4], {from: accounts[1]});
    expect(await fee.getOwners()).to.eql(_owners);
    for (let i = 0; i < _owners.length; i++) {
      expect(await fee.isOwner(_owners[i])).to.eql(true);
    }
  })
});

contract('owner manipulations - removal', (accounts) => {
  let fee;
  before(async function () {
    fee = await Fee.new(owners(accounts), 'FEE', 9, 'FEE');
  });

  it('non-owner should not be able to remove another owner', async function () {
    try {
      await fee.removeOwner(accounts[2], {from: accounts[4]});
      throw new Error('did not fail');
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
  });

  it('any owner can remove a owner', async function () {
    await fee.removeOwner(accounts[2]);
    let _owners = [accounts[0], accounts[1]];
    expect(await fee.getOwners()).to.eql(_owners);
    for (let i = 0; i < _owners.length; i++) {
      expect(await fee.isOwner(_owners[i])).to.eql(true);
    }
    expect(await fee.isOwner(accounts[2])).to.eql(false);
    await fee.addOwner(accounts[2]);
  });

  it("can not remove all the owners", async function () {
    await fee.removeOwner(accounts[2]);
    await fee.removeOwner(accounts[1]);
    try {
      await fee.removeOwner(accounts[0]);
      throw new Error('did not fail');
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
  });
});

contract('only owner', (accounts) => {
  let fee;
  before(async function () {
    fee = await Fee.new(owners(accounts), 'FEE', 9, 'FEE');
  });

  it('any owner can execute only owner method', async function () {
    await fee.setMinter(accounts[4], {from: accounts[0]});
    expect(await fee.minter()).to.eql(accounts[4]);
    await fee.setMinter(accounts[5], {from: accounts[1]});
    expect(await fee.minter()).to.eql(accounts[5]);
    await fee.setMinter(accounts[6], {from: accounts[2]});
    expect(await fee.minter()).to.eql(accounts[6]);
  });

  it('should fail when non-owner executes only owner function', async function () {
    try {
      await fee.setMinter(accounts[4], {from: accounts[5]});
      throw new Error('did not fail');
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
  })
});


function owners(accounts) {
  return [accounts[0], accounts[1], accounts[2]];
}
