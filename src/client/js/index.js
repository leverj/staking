import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import conf from './conf'
import './../css/index.css'
import {abi as stakeABI} from '../../../build/contracts/Stake.json'
import {abi as levABI} from '../../../build/contracts/Token.json'

class App extends React.Component {
  constructor () {
    super();

    window.web3 = new Web3(web3.currentProvider || new Web3.providers.HttpProvider(conf.network));
    window.stake = new web3.eth.Contract(stakeABI, conf.stake);
    window.lev = new web3.eth.Contract(levABI, conf.lev);

    // We use this.state because it updates the view automatically whenever this
    // object changes. This makes everything react to object changes
    this.state = {
      loadingInitialData: true
    };
    this.updateStakeData().then(() => {
      this.setState({loadingInitialData: false});
    })
  }

	toLev (amount) {
		return amount / 10e9;
	}

  updateStakeData () {
    return new Promise(async (resolve, reject) => {
		let account = (await web3.eth.getAccounts())[0]

      this.setState({
        account: account,
		  numberOfLev: await lev.methods.balanceOf(account).call(),
		  stakedLev: await stake.methods.stakes(account).call(),
		  approvedLev: this.toLev(await lev.methods.allowance(account, stake._address).call())
      }, resolve)
    })
  }

  // To approve 100 LEV tokens to the stake contract from the user address
  async approve (amount) {
    const estimateGas = await lev.methods.approve(
      this.state.customAccount || this.state.account,
      web3.utils.toWei(amount, 'ether')).estimateGas();
    const data = await lev.methods.approve(
      this.state.customAccount || this.state.account,
      web3.utils.toWei(amount, 'ether')).encodeABI();

    this.setState({
      transactionFieldsTo: stake._address,
      transactionFieldsAmount: 0,
      transactionFieldsGasLimit: estimateGas,
      transactionFieldsData: data,
      showTransactionFields: true
    })
  }

  async stakeTokens (stakeAmount) {
    const estimateGas = await stake.methods.stakeTokens(
      web3.utils.toWei(stakeAmount, 'ether')).estimateGas();
    const data = await stake.methods.stakeTokens(
      web3.utils.toWei(stakeAmount, 'ether')).encodeABI();

    this.setState({
      transactionFieldsTo: stake._address,
      transactionFieldsAmount: 0,
      transactionFieldsGasLimit: estimateGas,
      transactionFieldsData: data,
      showTransactionFields: true
    })
  }

  render () {
    return (
      <div>
			<Header />

			<ProgressBar
				className={this.state.loadingInitialData ? 'hidden' : 'bar-container'}
			/>

			<div className={this.state.loadingInitialData ? '' : 'hidden'}>
				<p>Loading initial data make sure you're on the Ropsten test network, please wait...</p>
			</div>

			<div className={this.state.loadingInitialData ? 'hidden' : 'boxes-container'}>
				<Stake
					classStake={this.state.loadingInitialData ? 'hidden' : 'stake'}
					isUpdatingStakeData={this.state.isUpdatingStakeData}
					setState={state => {
						this.setState(state)
					}}
					// TODO update this
					// updateStakeData={() => {
					// 	this.updateStakeData()
					// }}
					account={this.state.account}
					numberOfLev={this.state.numberOfLev}
					stakedLev={this.state.stakedLev}
					approvedLev={this.state.approvedLev}
				/>
				<Actions
					className="actions-box"
					setState={state => {
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
					transactionFieldsAmount={this.state.transactionFieldsAmount}
					transactionFieldsGasLimit={this.state.transactionFieldsGasLimit}
					transactionFieldsData={this.state.transactionFieldsData}
				/>
			</div>
      </div>
    )
  }
}

class ProgressBar extends React.Component {
	render () {
		return (
			<div className={this.props.className}>
				<div className="bar">
					<div className="bar-content">44%</div>
				</div>
				<p className="bar-start-block">Start: 195,242</p>
				<p className="bar-end-block">End: 195,512</p>
			</div>
		)
	}
}

class Header extends React.Component {
	render () {
		return (
			<div className="logo-container">
				<img src="img/favicon/android-chrome-512x512.png" className="logo"/>
				<p className="logo-text">Leverj</p>
				<p>Sample Text</p>
			</div>
		)
	}
}

class Actions extends React.Component {
	render() {
		return (
			<div className={this.props.className}>
				<h2>Actions</h2>

				<div className="actions-stake">
					<p>Amount to stake: &nbsp;</p>
					<input type="number" ref="stakeAmount-amount" onChange={() => {
						this.props.setState({stakeAmount: this.refs['stakeAmount-amount'].value})
					}}/>

					<br/>

					<button className="approve-button" onClick={() => {
						this.props.approve(this.props.stakeAmount)
					}}>Approve</button>
					<button className="stake-button" onClick={() => {
						this.props.stakeTokens(this.props.stakeAmount)
					}}>Stake</button><br/>
				</div>

				<p>Send to address: <span>{this.props.transactionFieldsTo}</span></p><br/>
				<p>Send amount: <span>{this.props.transactionFieldsAmount}</span></p><br/>
				<p>Send gas limit: <span>{this.props.transactionFieldsGasLimit}</span></p><br/>
				<p>Send data: </p><span>{this.props.transactionFieldsData}</span><br/>
			</div>
		)
	}
}

class Stake extends React.Component {
	render() {
		const {classStake, approvedLev, numberOfLev, stakedLev} = this.props
		return (
			<div className={classStake}>
				<h2>User Information</h2>

				<div>
					<p>Enter address: </p>
					<input type="text" ref="custom-account" />&nbsp;
					<button onClick={() => {
						this.props.setState({customAccount: this.refs['custom-account'].value})
					}}>Get Info</button><br/>
				</div>

				<div className="user-information">
					<p>Number of LEV: {numberOfLev}</p>
					<p>Staked LEV: {stakedLev}</p>
					<p>Approved LEV: {approvedLev}</p>
					<p>LEV available to withdraw: Unknown</p>
				</div>
			</div>
		)
	}
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
