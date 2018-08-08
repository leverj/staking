const affirm      = require("affirm.js");
const browserUtil = require("./browserUtil");
const Web3        = require('web3');
const feeABI      = require("../../../build/contracts/Fee.json").abi;
const levABI      = require("../../../build/contracts/Token.json").abi;
const stakeABI    = require("../../../build/contracts/Stake.json").abi;
const networks    = {
  "1" : "Select 'Main Ethereum Network' in MetaMask",
  "3" : "Select 'Ropsten Test Network' in MetaMask",
  "42": "Select 'Kovan Test Network' in MetaMask",
  "4" : "Select 'Rinkeby Test Network' in MetaMask",
};

module.exports = (function () {
  let contract        = {};
  contract.isManual   = browserUtil.getLocal("isManual") === "true";
  contract.user       = browserUtil.getLocal('userid');
  let stake, lev, fee, config;
  let userInfo        = {};
  contract.isMetaMask = function () {
    return !!(window.web3 && window.web3.currentProvider);
  };

  contract.setManual = async function (_isManual) {
    contract.isManual = _isManual;
    let provider      = _isManual ? config.network : window.web3.currentProvider;
    window.web3       = new Web3(provider);
    const networkId   = await web3.eth.net.getId()
    affirm(config.networkId === networkId, networks[config.networkId] ? networks[config.networkId] : "You have to select a correct network.");
    await setUser();
    stake = new web3.eth.Contract(stakeABI, config.stake);
    lev   = new web3.eth.Contract(levABI, config.lev);
    fee   = new web3.eth.Contract(feeABI, config.fee);
  };

  contract.setUser = function (_user) {
    contract.user = _user;
    browserUtil.setLocal("userid", _user);
  };

  contract.updateUserInfo = async function () {
    let result = await Promise.all([
      lev.methods.balanceOf(contract.user).call(),
      stake.methods.stakes(contract.user).call(),
      lev.methods.allowance(contract.user, config.stake).call(),
      fee.methods.balanceOf(contract.user).call()
    ]);
    result     = result.map(num => ((num - 0) / Math.pow(10, config.levDecimals)).toFixed(config.levDecimals) - 0);
    userInfo   = {
      userLink    : `${config.etherscan}/address/${contract.user}`,
      lev         : result[0],
      staked      : result[1],
      approved    : result[2],
      fee         : result[3],
      levLink     : `${config.etherscan}/token/${config.lev}?a=${contract.user}`,
      stakedLink  : `${config.etherscan}/address/${config.stake}#readContract`,
      approvedLink: `${config.etherscan}/address/${config.lev}#readContract`,
      feeLink     : `${config.etherscan}/token/${config.fee}?a=${contract.user}`,
    };
  };

  contract.getApproveInfo = async function (levCounts) {
    affirm(levCounts > 0, "Amount to approve must be greater than 0");
    let amount = Math.floor(levCounts * Math.pow(10, config.levDecimals));
    let tx     = await lev.methods.approve(config.stake, amount);
    return {
      address: config.lev,
      amount : 0,
      gas    : await tx.estimateGas({from: contract.user}),
      data   : tx.encodeABI()
    };
  };

  contract.approve = async function (levCounts, onHash) {
    if (contract.isManual) return;
    affirm(levCounts > 0, "Amount to approve must be greater than 0");
    let amount = Math.floor(levCounts * Math.pow(10, config.levDecimals));
    await lev
      .methods
      .approve(config.stake, amount)
      .send({from: contract.user})
      .on('transactionHash', function (hash) {
        onHash(hash);
      })
      .on('confirmation', function (confirmationNumber, receipt) {
        // console.log('confirmation', confirmationNumber, receipt)
      })
      .then(function (newContractInstance) {
        // console.log('newContractInstance', newContractInstance) // instance with the new contract address
      });
  };

  contract.getStakeInfo = async function (levCounts) {
    affirm(levCounts > 0, "Amount to stake must be greater than 0");
    let amount = Math.floor(levCounts * Math.pow(10, config.levDecimals));
    let tx     = await stake.methods.stakeTokens(amount);
    return {
      address: config.stake,
      amount : 0,
      gas    : await tx.estimateGas({from: contract.user}),
      data   : tx.encodeABI()
    };
  };

  contract.stake = async function (levCounts, onHash) {
    if (contract.isManual) return;
    affirm(levCounts > 0, "Amount to approve must be greater than 0");
    let amount = Math.floor(levCounts * Math.pow(10, config.levDecimals));
    await stake
      .methods
      .stakeTokens(amount)
      .send({from: contract.user})
      .on('transactionHash', function (hash) {
        onHash(hash);
      });
  };

  contract.getUserInfo = function () {
    return userInfo;
  };

  contract.getConfig = function () {
    return {
      lev      : config.lev,
      levLink  : `${config.etherscan}/address/${config.lev}`,
      fee      : config.fee,
      feeLink  : `${config.etherscan}/address/${config.fee}`,
      stake    : config.stake,
      stakeLink: `${config.etherscan}/address/${config.stake}`,
    }
  };

  contract.getTxLink = function (txHash) {
    return `${config.etherscan}/tx/${txHash}`;
  }

  async function setUser() {
    if (!contract.isManual) {
      let accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        throw new Error('METAMASK is locked. Please unlock it');
      }
      contract.user = accounts[0];
    }
  }

  async function init() {
    let response = await fetch('/api/v1/config', {
      method: 'GET'
    });
    config       = await response.json()
  }

  init();
  return contract;
}());
