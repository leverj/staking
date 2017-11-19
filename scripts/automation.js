const Web3 = require("web3");
const conf = require('./conf');
const stakeABI = require('./../build/contracts/Stake.json');

async function automate() {
  let web3, socketWeb3, stake, socketStake;
  let sendOptions = {}, state = {};

  async function getContracts() {
    socketWeb3 = new Web3(new Web3.providers.WebsocketProvider(conf.socketProvider));
    socketStake = new socketWeb3.eth.Contract(stakeABI.abi, conf.stake);
    web3 = new Web3(new Web3.providers.HttpProvider(conf.provider));
    stake = new web3.eth.Contract(stakeABI.abi, conf.stake);
  }

  async function createAccount() {
    let operator = await web3.eth.accounts.privateKeyToAccount(conf.privateKey);
    web3.eth.accounts.wallet.add(operator);
    sendOptions = {from: operator.address, gas: conf.gas};
  }

  async function init() {
    await getContracts();
    await createAccount();
    await updateContractState();
    await operateStake();
    startListening();
  }

  async function operateStake() {
    await updateFeeForCurrentStakingInterval();
    await redeemToUsers();
    await startNewStakingInterval();
  }

  async function startListening() {
    while(true){
      await updateContractState();
      if(state.currentBlock > state.endBlock) {
        try {
          await operateStake()
        } catch(error) {
          console.error(error)
        }
        await delay(10000)
      }
    }
  }

  function delay(time){
    return new Promise(function(resolve, reject){
      setTimeout(resolve, time)
    })
  }

  async function updateFeeForCurrentStakingInterval() {
    if (state.endBlock >= state.currentBlock || state.feeCalculated)
      return console.log("skipping updateFeeForCurrentStakingInterval", JSON.stringify(state));
    await stake.methods.updateFeeForCurrentStakingInterval().send(sendOptions);
    await updateContractState();
  }

  async function redeemToUsers(batch) {
    if (!state.feeCalculated)
      return console.log("skipping redeemToUsers", JSON.stringify(state));
    let users = await getAllStakingUsers();
    users = await getToBeRedeemed(users);

    let temporaryUsers = users.slice(batch);
    await stake.methods.redeemLevAndFeeToStakers(temporaryUsers).send(sendOptions);
    await updateContractState();
  }

  async function startNewStakingInterval() {
    if (state.endBlock > state.currentBlock || state.totalLevs > 0)
      return console.log("skipping startNewStakingInterval", JSON.stringify(state));
    let start = (await web3.eth.getBlock('latest')).number;
    let end = start + conf.blockInterval;
    await stake.methods.startNewStakingInterval(start, end).send(sendOptions);
    await updateContractState();
  }

  async function updateContractState() {
    let props = ["totalLevs", "startBlock", "endBlock", "feeCalculated"];
    let promises = props.map(prop => stake.methods[prop]().call());
    promises.push(web3.eth.getBlockNumber());
    let [totalLevs, startBlock, endBlock, feeCalculated, currentBlock] = await Promise.all(promises);
    state = {totalLevs, startBlock, endBlock, feeCalculated, currentBlock};
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

  await init();

}

automate().catch(console.error);