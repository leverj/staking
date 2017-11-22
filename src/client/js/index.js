import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import './../css/index.css'
import {abi as stakeABI} from '../../../build/contracts/Stake.json'
import {abi as levABI} from '../../../build/contracts/Token.json'
import UserInformation from './UserInformation'
import ProgressBar from './ProgressBar'
import Header from './Header'
import Actions from './Actions'
import Helper from './Helper'

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      loadingInitialData: true
    };

    this.init()
  }

  async init() {
    let response = await fetch('/api/v1/config', {
      method: 'GET'
    });

    window.config = await response.json();
    window.web3 = new Web3(window.web3 ? window.web3.currentProvider : new Web3.providers.HttpProvider(config.network));
    window.stake = new web3.eth.Contract(stakeABI, config.stake);
    window.lev = new web3.eth.Contract(levABI, config.lev);

    let startBlock = await stake.methods.startBlock().call();
    let endBlock = await stake.methods.endBlock().call();
    let currentBlock = (await web3.eth.getBlock('latest')).number;
    let percentage = currentBlock >= endBlock ? 100 : (currentBlock - startBlock) * 100 / (endBlock - startBlock);

    this.setState({
      startBlock: startBlock,
      endBlock: endBlock,
      barPercentage: percentage,
      stakeAddress: config.stake,
      levAddress: config.lev,
      feeAddress: config.fee,
      loadingInitialData: false,
      sale: config.sale,
      feeDecimals: config.feeDecimals,
      levDecimals: config.levDecimals,
    })
  }

  static levActualToDisplay(amount) {
    return (amount / Math.pow(10, config.levDecimals)).toFixed(config.levDecimals);
  }

  static feeActualToDisplay(amount) {
    return (amount / Math.pow(10, config.feeDecimals)).toFixed(config.feeDecimals);
  }

  static levDisplayToActuals(amount) {
    Math.floor(amount * Math.pow(10, config.levDecimals));
  }

  static feeDisplayToActuals(amount) {
    Math.floor(amount * Math.pow(10, config.feeDecimals));
  }

  async getInfo(account) {
    return new Promise(async (resolve, reject) => {
      let startBlock = await stake.methods.startBlock().call();
      let endBlock = await stake.methods.endBlock().call();
      let currentBlock = (await web3.eth.getBlock('latest')).number;
      let percentage = currentBlock >= endBlock ? 100 : (currentBlock - startBlock) * 100 / (endBlock - startBlock);

      this.setState({
        account: account,
        numberOfLev: `${App.levActualToDisplay(await lev.methods.balanceOf(account).call())}`,
        stakedLev: `${App.levActualToDisplay(await stake.methods.stakes(account).call())}`,
        approvedLev: `${App.levActualToDisplay(await lev.methods.allowance(account, stake._address).call())}`,
        startBlock: startBlock,
        endBlock: endBlock,
        barPercentage: percentage
      }, resolve)
    })
  }

  // To approve 100 LEV tokens to the stake contract from the user address
  async approve(amount) {
    let tx = await lev.methods.approve(this.state.account, App.levDisplayToActuals(amount));
    const estimateGas = tx.estimateGas();
    const data = tx.encodeABI();

    this.setState({
      transactionFieldsTo: stake._address,
      transactionFieldsAmount: 0,
      transactionFieldsGasLimit: estimateGas,
      transactionFieldsData: data,
      showTransactionFields: true
    })
  }

  async stakeTokens(stakeAmount) {
    let tx = await stake.methods.stakeTokens(App.levDisplayToActuals(stakeAmount));
    const estimateGas = tx.estimateGas();
    const data = tx.encodeABI();

    this.setState({
      transactionFieldsTo: stake._address,
      transactionFieldsAmount: 0,
      transactionFieldsGasLimit: estimateGas,
      transactionFieldsData: data,
      showTransactionFields: true
    })
  }

  render() {
    return (
      <div>
        <Header/>

        <ProgressBar
          className={this.state.loadingInitialData ? 'hidden' : ''}
          stakeAddress={this.state.stakeAddress}
          levAddress={this.state.levAddress}
          feeAddress={this.state.feeAddress}
          barPercentage={this.state.barPercentage}
          startBlock={this.state.startBlock}
          endBlock={this.state.endBlock}
        />

        <div className={this.state.loadingInitialData ? 'row justify-content-center' : 'hidden'}>
          <p>Loading initial data make sure you're on the Ropsten test network, please wait...</p>
        </div>

        <div className={this.state.loadingInitialData ? 'hidden' : 'container'}>
          <div className="row">
            <UserInformation
              className="col-md-6 user-information-box"
              isUpdatingStakeData={this.state.isUpdatingStakeData}
              getInfo={account => {
                this.getInfo(account)
              }}
              account={this.state.account}
              numberOfLev={this.state.numberOfLev}
              stakedLev={this.state.stakedLev}
              approvedLev={this.state.approvedLev}
            />

            <Actions
              className="col-md-6 actions-box border border-secondary rounded"
              setStakeAmount={state => {
                state.stakeAmount = `${App.levActualToDisplay(state.stakeAmount)}`;
                this.setState(state)
              }}
              approve={amount => {
                this.approve(amount)
              }}
              stakeTokens={amount => {
                this.stakeTokens(amount)
              }}
              transactionFieldsTo={this.state.transactionFieldsTo}
              transactionFieldsAmount={this.state.transactionFieldsAmount}
              transactionFieldsGasLimit={this.state.transactionFieldsGasLimit}
              transactionFieldsData={this.state.transactionFieldsData}
              isUpdatingAllowance={this.state.isUpdatingAllowance}
              allowance={this.state.allowance}
              customAccount={this.state.customAccount}
              stakeAmount={this.state.stakeAmount}
              showTransactionFields={this.state.showTransactionFields}
              account={this.state.account}
            />
          </div>
          <br/>

          <div className="row">
            <Helper/>
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <App/>,
  document.querySelector('#root')
);
