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

  // Special function from React that gets executed when the component is loaded
  componentDidMount() {
    // To activate additional information when the user hovers the data-toggle="tooltip" element
    $('[data-toggle="tooltip"]').tooltip()
  }

  async init() {
    let response = await fetch('/api/v1/config', {
      method: 'GET'
    });

    window.config = await response.json();
    window.web3 = new Web3(window.web3 ? window.web3.currentProvider : new Web3.providers.HttpProvider(config.network));
    window.stake = new web3.eth.Contract(stakeABI, config.stake);
    window.lev = new web3.eth.Contract(levABI, config.lev);
		const account = localStorage.account

		await this.updateInitialInformation()
		if(account) await this.getInfo(account)
  }

	async updateInitialInformation() {
		this.setState({updateInitialInformation: true})
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
			updateInitialInformation: false,
    })
	}

  static levActualToDisplay(amount) {
    return (amount / Math.pow(10, config.levDecimals)).toFixed(config.levDecimals);
  }

  static feeActualToDisplay(amount) {
    return (amount / Math.pow(10, config.feeDecimals)).toFixed(config.feeDecimals);
  }

  static levDisplayToActuals(amount) {
    return Math.floor(amount * Math.pow(10, config.levDecimals));
  }

  static feeDisplayToActuals(amount) {
    return Math.floor(amount * Math.pow(10, config.feeDecimals));
  }

  async getInfo(account) {
    return new Promise(async (resolve, reject) => {
      let startBlock = await stake.methods.startBlock().call();
      let endBlock = await stake.methods.endBlock().call();
      let currentBlock = (await web3.eth.getBlock('latest')).number;
      let percentage = currentBlock >= endBlock ? 100 : (currentBlock - startBlock) * 100 / (endBlock - startBlock);
			let feeCalculated = await stake.methods.feeCalculated().call();
			let levToWithdraw;
			let feeToWithdraw;

			const stakingExpired = currentBlock > endBlock;

			if(!stakingExpired || (stakingExpired && !feeCalculated)) {
				levToWithdraw = 0
				feeToWithdraw = 0
			} else if(stakingExpired && feeCalculated) {
				const levBlock = await stake.methods.levBlocks(account).call();
				const feeForTheStakingInterval = await stake.methods.feeForTheStakingInterval().call();
				const totalLevBlocks = await stake.methods.totalLevBlocks().call();

				levToWithdraw = App.levActualToDisplay(await stake.methods.stakes(account).call());
				if(Number(levBlock) === 0 || Number(feeForTheStakingInterval) === 0 || Number(totalLevBlocks) === 0) {
					feeToWithdraw = App.feeActualToDisplay(0)
				} else {
					feeToWithdraw = App.feeActualToDisplay(levBlock * feeForTheStakingInterval / totalLevBlocks);
				}
			}

			localStorage.setItem('account', account)

      this.setState({
        account: account,
        numberOfLev: `${App.levActualToDisplay(await lev.methods.balanceOf(account).call())}`,
        stakedLev: `${App.levActualToDisplay(await stake.methods.stakes(account).call())}`,
        approvedLev: `${App.levActualToDisplay(await lev.methods.allowance(account, stake._address).call())}`,
        startBlock: startBlock,
        endBlock: endBlock,
        barPercentage: percentage,
				levToWithdraw,
				feeToWithdraw,
      }, resolve)
    })
  }

  // To approve 100 LEV tokens to the stake contract from the user address
  async approve(amount) {
    let tx = await lev.methods.approve(this.state.account, amount);
    const estimateGas = await tx.estimateGas();
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
    let tx = await stake.methods.stakeTokens(stakeAmount);
    const estimateGas = await tx.estimateGas();
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
					account={this.state.account}
					updateInitialInformation={this.state.updateInitialInformation}
					updateGetInfo={() => {
						this.updateInitialInformation()
						this.getInfo(this.state.account)
					}}
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
							levToWithdraw={this.state.levToWithdraw}
							feeToWithdraw={this.state.feeToWithdraw}
            />

            <Actions
              className="col-md-6 actions-box border border-secondary rounded"
              setStakeAmount={state => {
                state.stakeAmount = App.levDisplayToActuals(state.stakeAmount);
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
