const HumanStandardToken = artifacts.require("./HumanStandardToken.sol");
const Stake              = artifacts.require("./Stake.sol");
const Fee                = artifacts.require("./Fee.sol");
const expect             = require("expect.js");

const {forceMine, balance, stakeit, sendFeesToSelf, sendEth, toNumber, customWeb3} = require('./help')

contract('Stake and withdraw in consecutive interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('user stake in interval 1 and withdraws in interval 2', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await affirm.stakeInterval(1, 11, 50, 0, 870, 0, 0, 25, false)
    await affirm.userState(user1, 1, 10, 360, 90, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(51)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 15, true)
    await affirm.stakeInterval(2, 51, 90, 0, 0, 0, 0, 15, false)
    await affirm.userState(user1, 0, 0, 0, 100, 1241379)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
  })
});

contract('Stake and withdraw in same interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('user should not be able to withdraw in same interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(40)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(1, 11, 50)
    await affirm.stakeInterval(1, 11, 50, 0, 870, 1000000000000, 2000000, 25, false)
    await affirm.userState(user1, 1, 10, 360, 90, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
  })
});


contract('stake => restake => withdraw in consecutive interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('user should be able to stake in interval 1 then restake in interval 2 and withdraw in interval 3', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    await forceMine(61)
    await stake.ensureInterval() //62
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 25, true)
    await affirm.userState(user1, 1, 10, 360, 90, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)

    await stakeit(15, user1, stake, token) //64
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 25 + 15, true)
    await affirm.stakeInterval(2, 51, 90, 0, 10 * 40 + 15 * (90 - 64) /*=790*/, 0, 0, 25 + 15, false)
    await affirm.userState(user1, 2, 10 + 15, 10 * 40 + 15 * (90 - 64) /*=790*/, 75, 1241379)
    await affirm.userState(user2, 1, 15, 510, 185, 0)

    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '3000000')
    await forceMine(91) //91
    await stake.withdraw({from: user1});
    await stake.withdraw({from: user2});
    await affirm.latestStakeInterval(3, 91, 130)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 0, true)
    await affirm.stakeInterval(2, 51, 90, 4000000, 10 * 40 + 15 * (90 - 64) /*=790*/, 0, 0, 0, true)
    await affirm.userState(user1, 0, 0, 0, 100, 1241379 + 4000000)
    await affirm.userState(user2, 0, 0, 0, 200, Math.floor(3000000 * 510 / 870))
  })
});

contract('stake => restake with negative amount', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('user should be able to reduce stake in subsequent interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    await forceMine(61)
    await stake.ensureInterval() //62
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 25, true)
    await affirm.userState(user1, 1, 10, 360, 90, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)

    await stakeit(-6, user1, stake, token) //63
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 25 - 6, true)
    await affirm.stakeInterval(2, 51, 90, 0, 4 * 40 /*=160*/, 0, 0, 25 - 6, false)
    await affirm.userState(user1, 2, 10 - 6, 4 * 40 /*=160*/, 96, 1241379)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
  })
});

contract('stake => restake with negative amount more than previously staked', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('user should be able to reduce stake in subsequent interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    await forceMine(61)
    await stake.ensureInterval() //62
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 25, true)
    await affirm.userState(user1, 1, 10, 360, 90, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)

    await stakeit(-12, user1, stake, token) //63
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 3000000, 870, 0, 0, 15, true)
    await affirm.stakeInterval(2, 51, 90, 0, 0, 0, 0, 15, false)
    await affirm.userState(user1, 0, 0, 0, 100, 1241379)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
  })
});

contract('staking and withdraw when no fee or eth have been collected', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('should send 0 FEE if staking period does not collect any FEE or ETH', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await forceMine(61)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(2, 51, 90)
    await affirm.stakeInterval(1, 11, 50, 0, 870, 0, 0, 15, true)
    await affirm.userState(user1, 0, 0, 0, 100, 0)
    await affirm.userState(user2, 1, 15, 510, 185, 0)
  })
});

contract('changing intervals', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });
  it('changing interval creates stake intervals based on new interval', async () => {
    await affirm.latestStakeInterval(1, 11, 50)
    await forceMine(100)
    await affirm.latestStakeInterval(1, 11, 50)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(2, 51, 130)
    await forceMine(200)
    await stake.setInterval(35)
    await affirm.latestStakeInterval(2, 51, 130)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(3, 131, 235)
  })
})

contract('Stake setup', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;

  before(async function () {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  });

  it('admin can change wallet address', async function () {
    expect(await stake.wallet()).to.eql(wallet);
    await stake.setWallet(user1, {from: admin});
    expect(await stake.wallet()).to.eql(user1);
    await stake.setWallet(wallet, {from: admin});
  });

  it('vandal can\'t change the wallet address', async function () {
    try {
      await stake.setWallet(user1, {from: user1});
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.not.eql("should not pass");
    }
    expect(await stake.wallet()).to.eql(wallet);
  });
  it('admin can change interval', async function () {
    expect(await stake.interval().then(toNumber)).to.eql(40);
    await stake.setInterval(50, {from: admin});
    expect(await stake.interval().then(toNumber)).to.eql(50);
    await stake.setInterval(40, {from: admin});
  });

  it('vandal can\'t change the interval', async function () {
    try {
      await stake.setInterval(50, {from: user1});
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.not.eql("should not pass");
    }
    expect(await stake.interval().then(toNumber)).to.eql(40);
  });
});

contract('generic call enabled on stake', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee;
  before(async function () {
    [stake, fee, token] = await setup([admin, user1, user2, user3, wallet, user5, operator]);
  })

  it('should be able to execute a method on any contract', async function () {
    let transferFEE         = 1e11;
    let feeContractFromWeb3 = new customWeb3.eth.Contract(fee.abi, fee.address)
    let data                = feeContractFromWeb3.methods.sendTokens(user1, transferFEE).encodeABI()
    let result              = await stake.execute(fee.address, 0, data)
    expect(await balance(user1, fee)).to.eql(transferFEE)
    expect(result.logs.length).to.eql(1)
    let log = result.logs[0];
    expect(log.event).to.eql("Execution")
    expect(log.args.destination).to.eql(fee.address)
    expect(log.args.value.toNumber()).to.eql(0)
    expect(log.args.data).to.eql(data)
  })

  it('should not allow to execute if account is not admin', async function () {
    let initialBalance      = await balance(user1, fee)
    let added               = 1e11;
    let feeContractFromWeb3 = new customWeb3.eth.Contract(fee.abi, fee.address)
    let data                = feeContractFromWeb3.methods.sendTokens(user1, added).encodeABI()
    try {
      await stake.execute(fee.address, 0, data, {from: user2})
      expect().to.fail('It should have failed')
    } catch (e) {
      expect(e.message).to.match(/VM Exception while processing transaction/)
    }
    expect(await balance(user1, fee)).to.eql(initialBalance)
  })
})

async function setup([admin, user1, user2, user3, wallet, user5, operator]) {
  const lev = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
  const fee = await Fee.new([admin], "Leverj FEE Token", "0", "FEE");
  await lev.transfer(user1, 100);
  await lev.transfer(user2, 200);
  await forceMine(10);
  const stake = await Stake.new([admin], operator, wallet, '1000000', lev.address, fee.address, '40') // 11
  await fee.setMinter(stake.address); //12
  let stateAffirm = StateAffirm(stake, fee, lev)
  return [stake, fee, lev, stateAffirm];
}


function StateAffirm(stake, fee, lev) {
  async function stakeInterval(intervalId, start, end, FEEGenerated, totalLevBlocks, ethBalance, FEEBalance, levBalance, FEECalculated) {
    try {
      expect(await stake.start(intervalId).then(toNumber)).to.be.eql(start)
      expect(await stake.end(intervalId).then(toNumber)).to.be.eql(end)
      expect(await stake.FEEGenerated(intervalId).then(toNumber)).to.be.eql(FEEGenerated)
      expect(await stake.totalLevBlocks(intervalId).then(toNumber)).to.be.eql(totalLevBlocks)
      expect(await balance(stake.address)).to.be.eql(ethBalance)
      expect(await balance(stake.address, fee)).to.be.eql(FEEBalance)
      expect(await balance(stake.address, lev)).to.be.eql(levBalance)
      expect(await stake.FEECalculated(intervalId)).to.be.eql(FEECalculated)
    } catch (e) {
      console.log(...arguments)
      throw e
    }
  }

  async function latestStakeInterval(intervalId, start, end) {
    try {
      expect(await stake.latest().then(toNumber)).to.be.eql(intervalId)
      expect(await stake.start(intervalId).then(toNumber)).to.be.eql(start)
      expect(await stake.end(intervalId).then(toNumber)).to.be.eql(end)
    } catch (e) {
      console.log(...arguments)
      throw e
    }
  }

  async function userState(user, intervalId, levStaked, levBlock, levBalance, FEEBalance) {
    try {
      expect(await stake.stakes(user).then(toNumber)).to.be.eql([intervalId, levStaked, levBlock])
      expect(await balance(user, lev)).to.be.eql(levBalance)
      expect(await balance(user, fee)).to.be.eql(FEEBalance)
    } catch (e) {
      console.log(...arguments)
      throw e
    }
  }

  return {stakeInterval, latestStakeInterval, userState}
}

