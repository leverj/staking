const Web3 = require("web3");
const conf = require('./conf');
const stakeABI = require('./../build/contracts/Stake.json');

async function automate() {
  let web3, socketWeb3, stake, socketStake, currentBlock, operationActive, operator, state = {}, errorCount=0;
  let gasPrice = 41e9;

  async function getContracts() {
    socketWeb3 = new Web3(new Web3.providers.WebsocketProvider(conf.socketProvider));
    socketStake = new socketWeb3.eth.Contract(stakeABI.abi, conf.stake);
    web3 = new Web3(new Web3.providers.HttpProvider(conf.provider));
    stake = new web3.eth.Contract(stakeABI.abi, conf.stake);
  }

  async function createAccount() {
    operator = await web3.eth.accounts.privateKeyToAccount(conf.privateKey);
    web3.eth.accounts.wallet.add(operator);
  }

  async function init() {
    await getContracts();
    await createAccount();
    await updateContractState();
    startListening();
  }

  async function operateStake() {
    console.log("updateFeeForCurrentStakingInterval start");
    await updateFeeForCurrentStakingInterval();
    console.log("redeemToUsers start");
    await redeemToUsers();
    console.log("startNewStakingInterval start");
    await startNewStakingInterval();
    console.log("startNewStakingInterval done")
  }

  function startListening() {
    socketWeb3.eth.subscribe('newBlockHeaders', async function (error, data) {
      if (error) console.error(e);
      gasPrice = Math.max((await web3.eth.getGasPrice()) - 0, 21e9);
      console.log('################ current block', data.number, 'gasPrice', gasPrice);
      currentBlock = data.number;
      if (currentBlock > state.endBlock && !operationActive) {
        operationActive = false;
        try {
          operationActive = true;
          await operateStake();
          errorCount=0;
        } catch (e) {
          console.log('operateStake ERROR', e);
          await handleNoUserError(e);
          if(errorCount === 5) process.exit(1);
          errorCount++;
        } finally {
          operationActive = false;
        }
      }
    });
  }

  async function updateFeeForCurrentStakingInterval() {
    if (state.endBlock >= currentBlock || state.feeCalculated)
      return console.log("skipping updateFeeForCurrentStakingInterval", JSON.stringify(state));
    await sendTx(stake, stake.methods.updateFeeForCurrentStakingInterval())
    await updateContractState();
  }

  async function redeemToUsers() {
    if (!state.feeCalculated)
      return console.log("skipping redeemToUsers", JSON.stringify(state));
    let users = await getAllStakingUsers();
    if (users.length === 0) return;
    users = await getToBeRedeemed(users);
    if (users.length === 0) return;
    let usersBatch = getUsersInBatches(users, conf.maxRedeem);
    for (let i = 0; i < usersBatch.length; i++) {
      let batch = usersBatch[i];
      console.log("redeem to", batch);
      await sendTx(stake, stake.methods.redeemLevAndFeeToStakers(batch))
    }
    await updateContractState();
  }

  function getUsersInBatches(users, maxRedeem) {
    if (users.length <= maxRedeem) {
      return [users];
    }
    let i = 0;
    let result = [];
    while (i < users.length) {
      result.push(users.slice(i, i + maxRedeem));
      i += maxRedeem;
    }
    return result;
  }

  async function startNewStakingInterval() {
    if (state.endBlock > currentBlock || state.totalLevs > 0)
      return console.log("skipping startNewStakingInterval", JSON.stringify(state));
    let start = (await web3.eth.getBlock('latest')).number;
    let end = start + conf.blockInterval;
    await sendTx(stake, stake.methods.startNewStakingInterval(start, end))
    await updateContractState();
  }

  async function updateContractState() {
    let props = ["totalLevs", "startBlock", "endBlock", "feeCalculated"];
    let promises = props.map(prop => stake.methods[prop]().call());
    let [totalLevs, startBlock, endBlock, feeCalculated] = await Promise.all(promises);
    state = {
      totalLevs: totalLevs - 0,
      startBlock: startBlock - 0,
      endBlock: endBlock - 0,
      feeCalculated: feeCalculated - 0
    };
  }

  async function getToBeRedeemed(users) {
    let promises = users.map(user => stake.methods.stakes(user).call());
    let levStaked = await Promise.all(promises);
    return users.filter((user, i) => levStaked[i] > 0);
  }

  async function getAllStakingUsers() {
    let [fromBlock, toBlock] = await Promise.all([stake.methods.startBlock().call(), stake.methods.endBlock().call()]);
    let events = await socketStake.getPastEvents('StakeEvent', {fromBlock, toBlock});
    let stakes = {};
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      stakes[event.returnValues.user] = true;
    }
    return Object.keys(stakes);
  }

  async function handleNoUserError(e) {
    if (e.message === 'No "from" address specified in neither the given options, nor the default options.') {
      await createAccount();
    }
  }

  async function sendTx(contract, tx) {
    contract.options.from = operator.address;
    let gas = await tx.estimateGas();
    console.log('gas', gas);
    await tx.send({from: operator.address, gas, gasPrice: gasPrice})
  }

  await init();

}

automate().catch((e) => {
  console.error(e)
  process.exit(1)
});