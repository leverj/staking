const Web3 = require('web3');
const config = require('./conf');
const feeABI = require('../../build/contracts/Fee.json').abi;
const levABI = require('../../build/contracts/Token.json').abi;
const stakeABI = require('../../build/contracts/Stake.json').abi;

module.exports = (function () {
  let client = {};
  let lev, stake, fee, user;

  async function populate() {
    web3 = new Web3(web3.currentProvider) || new Web3.providers.HttpProvider('https://ropsten.infura.io');
    user = (await web3.eth.getAccounts())[0];
    stake = new web3.eth.Contract(stakeABI, config.stake);
    lev = new web3.eth.Contract(levABI, config.lev);
    fee = new web3.eth.Contract(feeABI, config.fee);
    await loadStake();
    await staking();
  }

  function blocks(minutes) {
    return Math.round(minutes * 60 / 25);
  }

  async function loadStake() {
    let block = await web3.eth.getBlockNumber();
    $('#start-block').val(block + blocks(1));
    $('#end-block').val(block + blocks(35));
    $('#stake-setup').click(setupStake);
    $('#feeid').val(config.fee);
    $('#fee-setup').click(setupfee);
    displayDetails('current block', block);
    let props = ['totalLevs', 'totalLevBlocks', 'weiPerFee', 'feeForThePeriod', 'tokenid', 'startBlock', 'expiryBlock', 'owner', 'wallet', 'feeTokenId', 'weiAsFee', 'feeCalculated'];
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      let value = await stake.methods[prop]().call();
      displayDetails(prop, value);
    }
  }

  async function staking() {
    $('#lev-approve').click(approveLEV);
    $('#lev-stake').click(stakeLEV);
    $('#update-fee').click(updateFee);
    $('#redeem-lev-fee').click(redeem);
    $('#set-minter').click(setMinter);
    $('#restart-stake').click(restartStake);
    $('#send-fee').click(sendFeeTokens);
    displayDetails('user lev balance', await lev.methods.balanceOf(user).call());
    displayDetails('user lev approve', await lev.methods.allowance(user, config.stake).call());
    displayDetails('user lev blocks', await stake.methods.levBlocks(user).call());
    displayDetails('user lev stake', await stake.methods.stakes(user).call());
    displayDetails('fee with stake', await fee.methods.balanceOf(config.stake).call());
    displayDetails('fee with user', await fee.methods.balanceOf(user).call());
    displayDetails('Fee Owner', await fee.methods.owner().call());
    displayDetails('Fee Minter', await fee.methods.minter().call());
    displayDetails('Stake', config.stake);
    $('#get-events').click(getEvents)
  }

  function displayDetails(key, value) {
    $('#stake-details').append('<div>' + key + ': ' + value + '</div>');
  }

  async function approveLEV() {
    let levs = $('#lev-count').val() - 0;
    await lev.methods.approve(config.stake, levs).send({from: user});
  }

  async function stakeLEV() {
    let levs = $('#lev-count').val() - 0;
    await stake.methods.stakeTokens(levs).send({from: user});
  }

  async function updateFee() {
    await stake.methods.updateFeeForCurrentPeriod().send({from: user});
  }

  async function redeem() {
    await stake.methods.redeemLevAndFee(user).send({from: user});
  }

  async function setMinter() {
    await fee.methods.setMinter(config.stake).send({from: user});
  }

  async function restartStake() {
    let start = $('#start-block').val() - 0;
    let end = $('#end-block').val() - 0;
    await stake.methods.startNewTradingPeriod(start, end).send({from: user});
  }

  async function sendFeeTokens() {
    let feeCount = $('#fee-count').val() - 0;
    await fee.methods.transfer(config.stake, feeCount).send({from: user});
  }

  async function setupfee() {
    await stake.methods.setFeeToken($('#feeid').val()).send({from: user});
  }

  async function setupStake() {
    let start = $('#start-block').val() - 0;
    let end = $('#end-block').val() - 0;
    await stake.methods.setBlocks(start, end).send({from: user});
  }

  async function getEvents() {
    console.log('Executed')
    const events = await stake.getPastEvents('StakeEvent')
    console.log('Events')
    console.log(events)
  }

  function init() {
    populate();
    // handleEvents();
  }

  $(document).ready(init);

  return client
})();
