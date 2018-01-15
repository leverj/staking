const $ = require("jquery");
const Web3 = require('web3');
const feeABI = require("../../../build/contracts/Fee.json").abi;
const levABI = require("../../../build/contracts/Token.json").abi;
const stakeABI = require("../../../build/contracts/Stake.json").abi;

module.exports = (function () {
  let client = {};
  let lev, stake, fee, user, config;

  async function populate() {
    let currentProvider = window.web3 && window.web3.currentProvider;
    console.log(currentProvider);
    window.web3 = new Web3(currentProvider || new Web3.providers.HttpProvider(config.network));
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
    $("#start-block").val(block + blocks(1));
    $("#end-block").val(block + blocks(35));
    $("#stake-setup").click(setupStake);
    $("#feeid").val(config.fee);
    $("#levid").val(config.lev);
    $("#fee-setup").click(setupfee);
    $("#lev-setup").click(setuplev);
    $("#set-operator").click(setOperator);
    displayDetails("current block", block);
    let props = ["totalLevs", "totalLevBlocks", "weiPerFee", "feeForTheStakingInterval", "levToken", "feeToken", "startBlock", "endBlock", "wallet", "feeCalculated", "getOwners", "operator"];
    for (let i = 0; i < props.length; i++) {
      let prop = props[i];
      let promise = stake.methods[prop]().call();
      displayDetailsAsync(prop, promise);
    }
  }

  async function displayDetailsAsync(key, promise) {
    console.log('start',key)
    try {
      displayDetails(key, await promise);
    } catch (e) {
      console.log(key, e);
    }
    console.log('end', key)
  }

  async function staking() {
    $("#lev-approve").click(approveLEV);
    $("#lev-stake").click(stakeLEV);
    $("#update-fee").click(updateFee);
    $("#redeem-lev-fee").click(redeem);
    $("#set-minter").click(setMinter);
    $("#restart-stake").click(restartStake);
    $("#flip-calculated").click(flipCalculated);
    $("#send-fee").click(sendFeeTokens);
    $("#add-owner").click(addOwner);
    displayDetailsAsync("user lev balance", lev.methods.balanceOf(user).call());
    displayDetailsAsync("user lev approve", lev.methods.allowance(user, config.stake).call());
    displayDetailsAsync("user lev blocks", stake.methods.levBlocks(user).call());
    displayDetailsAsync("user lev stake", stake.methods.stakes(user).call());
    displayDetailsAsync("fee with stake", fee.methods.balanceOf(config.stake).call());
    displayDetailsAsync("fee with user", fee.methods.balanceOf(user).call());
    displayDetailsAsync("Fee Owner", fee.methods.getOwners().call());
    displayDetailsAsync("Fee Minter", fee.methods.minter().call());
    displayDetails("Stake", config.stake);

    // let ropsten = new Web3(new Web3.providers.HttpProvider("http://51.15.173.167:8545"));
    // let levRopsten = new ropsten.eth.Contract(levABI, config.lev);
    // console.log(await levRopsten.getPastEvents("allEvents"));
    /*
        levRopsten.events.Approval({fromBlock: 0, toBlock: 'latest'}, (error, result) => {
          if (error) {
            console.error(error);
          }
          console.log(result);
        });
    */
    // try {
    //   displayDetails("user lev balance", await lev.methods.balanceOf(user).call());
    //   displayDetails("user levRopsten balance", await levRopsten.methods.balanceOf(user).call());
    // } catch (e) {
    //   console.log(e);
    // }


    // console.log("events", await stake.getPastEvents("StakeEvent", {fromBlock: 0, toBlock: 'latest'}));
  }

  function displayDetails(key, value) {
    $("#stake-details").append("<div><code>" + key + ": " + value + "</code></div>");
  }

  async function approveLEV() {
    let levs = $("#lev-count").val() - 0;
    await lev.methods.approve(config.stake, levs).send({from: user});
  }

  async function stakeLEV() {
    let levs = $("#lev-count").val() - 0;
    await stake.methods.stakeTokens(levs).send({from: user});
  }

  async function updateFee() {
    await stake.methods.updateFeeForCurrentStakingInterval().send({from: user});
  }

  async function redeem() {
    await stake.methods.redeemLevAndFeeByStaker().send({from: user});
  }

  async function setMinter() {
    await fee.methods.setMinter(config.stake).send({from: user});
  }

  async function restartStake() {
    let start = $("#start-block").val() - 0;
    let end = $("#end-block").val() - 0;
    await stake.methods.startNewStakingInterval(start, end).send({from: user});
  }

  async function flipCalculated() {
    let current = await stake.methods.feeCalculated().call();
    await stake.methods.revertFeeCalculatedFlag(!current).send({from: user});
  }

  async function addOwner() {
    let owner = $("#new-owner").val();
    await stake.methods.addOwner(owner).send({from: user});
  }

  async function sendFeeTokens() {
    let feeCount = $("#fee-count").val() - 0;
    await fee.methods.transfer(config.stake, feeCount).send({from: user});
  }

  async function setupfee() {
    await stake.methods.setFeeToken($("#feeid").val()).send({from: user});
  }

  async function setuplev() {
    await stake.methods.setLevToken($("#levid").val()).send({from: user});
  }

  async function setOperator() {
    await stake.methods.setOperator($("#operator").val()).send({from: user});
  }

  async function setupStake() {
    let start = $("#start-block").val() - 0;
    let end = $("#end-block").val() - 0;
    await stake.methods.startNewStakingInterval(start, end).send({from: user});
  }


  async function init() {
    let response = await fetch('/api/v1/config', {
      method: 'GET'
    });
    config = await response.json();
    await populate();
    // handleEvents();
  }

  $(document).ready(function () {
    init();
  });

  return client
})();
