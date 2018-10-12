const HumanStandardToken = artifacts.require("./HumanStandardToken.sol");
const Stake = artifacts.require("./Stake.sol");
const Fee = artifacts.require("./Fee.sol");
const Mock = artifacts.require("./external/Mock.sol");
const expect = require("expect.js");

const {forceMine, balance, stakeit, sendFeesToSelf, sendEth, toNumber, customWeb3, bounce} = require('./help')

contract('changing intervals', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('changing interval creates stake intervals based on new interval', async () => {
    await affirm.latestStakeInterval(1, 10, 50)
    await forceMine(40)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(1, 10, 50)
    await forceMine(49)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(2, 50, 90)
    await forceMine(100)
    await affirm.latestStakeInterval(2, 50, 90)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(3, 90, 130)
    await forceMine(200)
    await stake.setIntervalSize(35)
    await affirm.latestStakeInterval(4, 130, 210)
    await forceMine(210)
    await stake.ensureInterval()
    await affirm.latestStakeInterval(5, 210, 245)
  })
})

contract('calculate distributed earning', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user should be able to stake in interval 1 then restake in interval 2 and withdraw in interval 3', async () => {
    await sendFeesToSelf(stake.address, admin, fee, '80')
    await sendEth(admin, stake.address, "40")
    await forceMine(49)
    let [feeEarned, ethEarned] = await stake.calculateIntervalEarning(10, 50).then(toNumber);
    expect([feeEarned, ethEarned]).to.be.eql([80, 40])
    await forceMine(69);
    [feeEarned, ethEarned] = await stake.calculateIntervalEarning(10, 50).then(toNumber);
    expect([feeEarned, ethEarned]).to.be.eql([80, 40].map(_ => Math.floor(_ * 40 / 60)))

  })
})

contract('Stake and withdraw in consecutive interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user stake in interval 1 and withdraws in interval 2', async () => {
    await stakeit(10, user1, stake, token) //13
    await stakeit(15, user2, stake, token) //15
    await affirm.userState(user1, [1, 10, 10 * (50 - 13)/*370*/], 90, 0)
    await affirm.userState(user2, [1, 15, 15 * (50 - 15)/*525*/], 185, 0)
    await affirm.stakeInterval(1, 10, 50, 0, 895, 0, 0, 25, 0)
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(49)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 3000000, 895, 0, 0, 15, 1759777)
    await affirm.stakeInterval(2, 50, 90, 0, 0, 0, 0, 15, 1759777)
    await affirm.userState(user1, [0, 0, 0], 100, Math.floor(3000000 * 370 / 895))
    await affirm.userState(user2, [1, 15, 525], 185, 0)
  })
});

contract('Stake and withdraw in same interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user should not be able to withdraw in same interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(40)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(1, 10, 50)
    await affirm.stakeInterval(1, 10, 50, 0, 895, 1000000000000, 2000000, 25, 0)
    await affirm.userState(user1, [1, 10, 370], 90, 0)
    await affirm.userState(user2, [1, 15, 525], 185, 0)
  })
});


contract('stake => restake => withdraw in consecutive interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user should be able to stake in interval 1 then restake in interval 2 and withdraw in interval 3', async () => {
    await stakeit(10, user1, stake, token) //13
    await stakeit(15, user2, stake, token) //15
    await sendEth(admin, stake.address, "1000000000000") //16
    await sendFeesToSelf(stake.address, admin, fee, '2000000') //17
    await forceMine(61)
    await stake.ensureInterval() //62

    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 25, 2307691)
    await affirm.userState(user1, [1, 10, 370], 90, 0)
    await affirm.userState(user2, [1, 15, 525], 185, 0)

    await stakeit(15, user1, stake, token) //64
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 25 + 15, 1353674)
    await affirm.stakeInterval(2, 50, 90, 0, 10 * 40 + 15 * (90 - 64) /*=790*/, 230769230770, 461539, 25 + 15, 1353674)
    await affirm.userState(user1, [2, 10 + 15, 10 * 40 + 15 * (90 - 64) /*=790*/], 75, 954017)
    await affirm.userState(user2, [1, 15, 525], 185, 0)

    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '3000000')
    await forceMine(91) //91
    await stake.withdraw({from: user1});
    await stake.withdraw({from: user2});
    await affirm.latestStakeInterval(3, 90, 130)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 58608058609, 164836, 0, 1)
    await affirm.stakeInterval(2, 50, 90, 4468864, 10 * 40 + 15 * (90 - 64) /*=790*/, 58608058609, 164836, 0, 1)
    await affirm.userState(user1, [0, 0, 0], 100, 954017 + 4468864)
    await affirm.userState(user2, [0, 0, 0], 200, Math.floor(2307691 * 525 / 895))
  })
});

contract('stake => restake with negative amount', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user should be able to reduce stake in subsequent interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    // let proportions = calculateFEEAndEthProportion(50, 90, 92, 3000000 + 461539, 1000000000000 + 230769230770)
    // let proportions = calculateFEEAndEthProportion(10, 50, 62, 2000000, 1000000000000)

    await forceMine(61)
    await stake.ensureInterval() //62
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 25, 2307691)
    await affirm.userState(user1, [1, 10, 370], 90, 0)
    await affirm.userState(user2, [1, 15, 525], 185, 0)

    await stakeit(-6, user1, stake, token) //63
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 25 - 6, 1353674)
    await affirm.stakeInterval(2, 50, 90, 0, 4 * 40 /*=160*/, 230769230770, 461539, 25 - 6, 1353674)
    await affirm.userState(user1, [2, 10 - 6, 4 * 40 /*=160*/], 96, Math.floor(2307691 * 370 / 895))
    await affirm.userState(user2, [1, 15, 525], 185, 0)
  })
});

contract('stake => restake with negative amount more than previously staked', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('user should be able to reduce stake in subsequent interval', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    await forceMine(61)
    await stake.ensureInterval() //62
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 25, 2307691)
    await affirm.userState(user1, [1, 10, 370], 90, 0)
    await affirm.userState(user2, [1, 15, 525], 185, 0)

    await stakeit(-12, user1, stake, token) //63
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 2307691, 895, 230769230770, 461539, 15, 1353674)
    await affirm.stakeInterval(2, 50, 90, 0, 0, 230769230770, 461539, 15, 1353674)
    await affirm.userState(user1, [0, 0, 0], 100, Math.floor(2307691 * 370 / 895))
    await affirm.userState(user2, [1, 15, 525], 185, 0)
  })
});

contract('staking and withdraw when no fee or eth have been collected', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('should send 0 FEE if staking period does not collect any FEE or ETH', async () => {
    await stakeit(10, user1, stake, token) //14
    await stakeit(15, user2, stake, token) //16
    await forceMine(61)
    await stake.withdraw({from: user1})
    await affirm.latestStakeInterval(2, 50, 90)
    await affirm.stakeInterval(1, 10, 50, 0, 895, 0, 0, 15, 0)
    await affirm.userState(user1, [0, 0, 0], 100, 0)
    await affirm.userState(user2, [1, 15, 525], 185, 0)
  })
});

contract('restake calculation', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('restake should use full interval length', async () => {
    await stakeit(10, user1, stake, token)
    await forceMine(100)
    await stakeit(15, user1, stake, token)
    await affirm.latestStakeInterval(2, 50, 130)
    await affirm.stakeInterval(1, 10, 50, 0, 370, 0, 0, 25, 0)
    await affirm.stakeInterval(2, 50, 130, 0, 1220, 0, 0, 25, 0)
    await affirm.userState(user1, [2, 25, 1220], 75, 0)
  })
});

contract.skip('sending eth should initiate new staking interval', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm, mock;
  before(async () => {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator])
    mock = await Mock.new()
  })

  it('sending eth should initiate new staking interval', async () => {
    await affirm.latestStakeInterval(1, 10, 50)
    await forceMine(40)
    await mock.sendFunds(stake.address, {value: 1})
    await affirm.latestStakeInterval(1, 10, 50)
    await forceMine(49)
    // const state = await stake.calculateDistributedIntervalEarning(10, 50).then(toNumber)
    // console.log({state})
    await mock.sendFunds(stake.address, {value: 1})
    // await affirm.latestStakeInterval(2, 50, 90)
  })
})

contract('Stake setup', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

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
    expect(await stake.intervalSize().then(toNumber)).to.eql(40);
    await stake.setIntervalSize(50, {from: admin});
    expect(await stake.intervalSize().then(toNumber)).to.eql(50);
    await stake.setIntervalSize(40, {from: admin});
  });

  it('vandal can\'t change the interval', async function () {
    try {
      await stake.setIntervalSize(50, {from: user1});
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.not.eql("should not pass");
    }
    expect(await stake.intervalSize().then(toNumber)).to.eql(40);
  });
});

contract('generic call enabled on stake', ([admin, user1, user2, user3, wallet, user5, operator]) => {
  let token, stake, fee, affirm, mock;
  before(async () => {
    [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator])
    mock = await Mock.new()
  });//11

  it('should not be able to execute a method on FEE contract', async function () {
    let transferFEE = 1e11;
    let feeContractFromWeb3 = new customWeb3.eth.Contract(fee.abi, fee.address)
    let data = feeContractFromWeb3.methods.sendTokens(user1, transferFEE).encodeABI()
    try {
      let result = await stake.execute(fee.address, 0, data)
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.match(/VM Exception while processing transaction/)
    }
  })

  it('should not be able to execute a method on LEV contract', async function () {
    let transferLEV = 1;
    await token.transfer(stake.address, transferLEV);
    let levContractFromWeb3 = new customWeb3.eth.Contract(token.abi, token.address)
    let data = levContractFromWeb3.methods.transfer(user1, transferLEV).encodeABI()
    try {
      let result = await stake.execute(token.address, 0, data)
      expect().fail("should not pass");
    } catch (e) {
      expect(e.message).to.match(/VM Exception while processing transaction/)
    }
  })

  it("should allow execute method on some contract", async function () {
    expect(await mock.keys(stake.address)).to.eql('0x0000000000000000000000000000000000000000')
    let web3Mock = new customWeb3.eth.Contract(mock.abi, mock.address)
    let data = web3Mock.methods.registerKey(user1).encodeABI()
    let result = await stake.execute(mock.address, 0, data)
    expect(await mock.keys(stake.address)).to.eql(user1)
    expect(result.logs.length).to.eql(1)
    let log = result.logs[0];
    expect(log.event).to.eql("Execution")
    expect(log.args.destination).to.eql(mock.address)
    expect(log.args.value.toNumber()).to.eql(0)
    expect(log.args.data).to.eql(data)
  })

  it('should not allow to execute if account is not admin', async function () {
    let web3Mock = new customWeb3.eth.Contract(mock.abi, mock.address)
    let data = web3Mock.methods.registerKey(user1).encodeABI()
    try {
      await stake.execute(mock.address, 0, data, {from: user2})
      expect().to.fail('It should have failed')
    } catch (e) {
      expect(e.message).to.match(/VM Exception while processing transaction/)
    }
  })
})

contract('stake and restakes', function ([admin, user1, user2, user3, wallet, user5, operator]) {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11

  it('multiple users', async function () {
    await Promise.all([token.transfer(user3, 100), token.transfer(wallet, 100), token.transfer(user5, 100)])
    await stakeit(15, user1, stake, token)
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(100)

    await stakeit(16, user2, stake, token)
    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await forceMine(200)

    await sendEth(admin, stake.address, "1000000000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')
    await stakeit(17, user3, stake, token)
    await forceMine(300)

    await stakeit(18, wallet, stake, token)
    await forceMine(400)

    await stakeit(19, user5, stake, token)
    await forceMine(500)
    await sendEth(admin, stake.address, "947851305141")
    await stakeit(-10, user1, stake, token)
    await stakeit(-10, user3, stake, token)
    await stakeit(-10, user2, stake, token)
    await stakeit(-10, wallet, stake, token)
    await stakeit(-10, user5, stake, token)
  })

})

contract('halt', function ([admin, user1, user2, user3, wallet, user5, operator]) {
  let token, stake, fee, affirm;
  before(async () => [stake, fee, token, affirm] = await setup([admin, user1, user2, user3, wallet, user5, operator]));//11
  it('should halt staking, transfer eth to wallet and let everyone withdraw their levs and FEE generated', async function () {
    await stakeit(10, user1, stake, token)
    await forceMine(99)
    await stakeit(0, user1, stake, token)
    await stakeit(15, user2, stake, token)
    await sendEth(admin, stake.address, "10000000")
    await sendFeesToSelf(stake.address, admin, fee, '2000000')

    await affirm.latestStakeInterval(2, 50, 130)
    await affirm.stakeInterval(2, 50, 130, 0, 1220, 10000000, 2000000, 25, 0)
    await affirm.userState(user1, [2, 10, 800], 90, 0)
    await affirm.userState(user2, [2, 15, 420], 185, 0)

    try {
      await stake.halt({from: user1})
      throw new Error('non admin user was able to halt stake')
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
    await stake.halt()
    try {
      await stakeit(10, user1, stake, token)
      throw new Error('staking happens after halt')
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
    try {
      await stake.ensureInterval()
      throw new Error('interval updates after stake halt')
    } catch (e) {
      expect(e.message).to.eql('VM Exception while processing transaction: revert')
    }
    await affirm.latestStakeInterval(3, 108, 148)
    await affirm.stakeInterval(2, 50, 108, 2000010, 1220, 0, 0, 25, 2000010)
    await stake.withdraw({from: user1})
    await affirm.userState(user1, [0, 0, 0], 100, 1311481)
    await stake.withdraw({from: user2})
    await affirm.userState(user2, [0, 0, 0], 200, 688528)
  })
})

async function setup([admin, user1, user2, user3, wallet, user5, operator]) {
  const lev = await HumanStandardToken.new(100000, "LEV", 0, "LEV");
  const fee = await Fee.new([admin], "Leverj FEE Token", "0", "FEE");
  await lev.transfer(user1, 100);
  await lev.transfer(user2, 200);
  await forceMine(9);
  const stake = await Stake.new([admin], wallet, '1000000', lev.address, fee.address, '40', '1.0.0') // 10
  expect(await stake.version()).to.eql('1.0.0')
  await fee.setMinter(stake.address); //11
  let stakeAffirm = StakeAffirm(stake, fee, lev)
  return [stake, fee, lev, stakeAffirm];
}

function calculateFEEAndEthProportion(start, end, current, feeEarned, ethEarned) {
  let total = current - start
  let left = current - end
  let [feeLeft, ethLeft] = [feeEarned, ethEarned].map(_ => Math.ceil(_ * left / total))
  let feeGenerated = Math.floor((feeEarned - feeLeft) + (ethEarned - ethLeft) / 1000000)
  console.log({feeLeft, ethLeft, feeGenerated})
  return {feeLeft, ethLeft, feeGenerated}
}

function StakeAffirm(stake, fee, lev) {
  async function stakeInterval(intervalId, start, end, FEEGenerated, totalLevBlocks, ethBalance, FEEBalance, levBalance, toBeDistributed) {
    let interval = await getInterval(stake, intervalId)
    expect([
      intervalId,
      interval.start,
      interval.end,
      interval.FEEGenerated,
      interval.totalLevBlocks,
      await balance(stake.address).then(_ => _ - 0),
      (await balance(stake.address, fee) - await stake.FEE2Distribute()),
      await balance(stake.address, lev),
      await stake.FEE2Distribute().then(_ => _ - 0)
    ]).to.be.eql([...arguments])
  }

  async function latestStakeInterval(intervalId, start, end) {
    let latest = await stake.latest().then(toNumber);
    let interval = await getInterval(stake, latest)
    expect([latest, interval.start, interval.end]).to.be.eql([...arguments])

  }

  async function userState(user, [intervalId, levStaked, levBlock], levBalance, FEEBalance) {
    expect(await Promise.all([
      bounce(user),
      stake.stakes(user).then(toNumber),
      balance(user, lev),
      balance(user, fee),
    ])).to.be.eql([...arguments])
  }

  return {stakeInterval, latestStakeInterval, userState}
}

async function getInterval(stake, intervalId) {
  let interval = await stake.intervals(intervalId)
  return {
    totalLevBlocks: toNumber(interval[0]),
    FEEGenerated: toNumber(interval[1]),
    start: toNumber(interval[2]),
    end: toNumber(interval[3]),
    FEECalculated: interval[4],
  }
}

