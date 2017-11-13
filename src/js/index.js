import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import conf from './conf'
import './../css/index.css'
import {abi as stakeABI} from '../../build/contracts/Stake.json'
import {abi as levABI} from '../../build/contracts/Token.json'

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
      this.updateAllowance()
    })
  }

  updateStakeData () {
    return new Promise(async (resolve, reject) => {
      // Use this.setState to change the state object
      this.setState({
        account: (await web3.eth.getAccounts())[0],
        totalLevs: await stake.methods.totalLevs().call(),
        totalLevBlocks: await stake.methods.totalLevBlocks().call(),
        weiPerFee: await stake.methods.weiPerFee().call(),
        feeForThePeriod: await stake.methods.feeForThePeriod().call(),
        tokenid: await stake.methods.tokenid().call(),
        startBlock: await stake.methods.startBlock().call(),
        expiryBlock: await stake.methods.expiryBlock().call(),
        currentPeriod: await stake.methods.currentPeriod().call(),
        owner: await stake.methods.owner().call(),
        wallet: await stake.methods.wallet().call(),
        feeTokenId: await stake.methods.feeTokenId().call(),
        weiAsFee: await stake.methods.weiAsFee().call(),
        feeCalculated: await stake.methods.feeCalculated().call()
      }, resolve)
    })
  }

  updateAllowance () {
    return new Promise(async (resolve, reject) => {
      // Use this.setState to change the state object
      this.setState({
        allowance: web3.utils.fromWei(await lev.methods.allowance(this.state.account, stake._address).call(), 'ether')
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
			<div className={this.state.loadingInitialData ? '' : 'hidden'}>
				<p>Loading initial data make sure you're on the Ropsten test network, plase wait...</p>
			</div>

			<div className={this.state.loadingInitialData ? 'hidden' : 'contract-data'}>
				<Actions
					transactionFieldsTo={this.state.transactionFieldsTo}
					transactionFieldsAmount={this.state.transactionFieldsAmount}
					transactionFieldsGasLimit={this.state.transactionFieldsGasLimit}
					transactionFieldsData={this.state.transactionFieldsData}
					isUpdatingAllowance={this.state.isUpdatingAllowance}
					allowance={this.state.allowance}
					customAccount={this.state.customAccount}
					approveAmount={this.state.approveAmount}
					stakeAmount={this.state.stakeAmount}
				/>
			</div>

			<StakeBox
				className={this.state.loadingInitialData ? 'hidden' : 'contract-data'}
				setState={state => {
					this.setState(state)
				}}
				showTransactionFields={this.state.showTransactionFields}
				transactionFieldsAmount={this.state.transactionFieldsAmount}
				transactionFieldsGasLimit={this.state.transactionFieldsGasLimit}
				transactionFieldsData={this.state.transactionFieldsData}
			/>

			<Stake
				classStake={this.state.loadingInitialData ? 'hidden' : 'contract-data'}
				isUpdatingStakeData={this.state.isUpdatingStakeData}
				setState={state => {
					this.setState(state)
				}}
				updateStakeData={() => {
					this.updateStakeData()
				}}
				account={this.state.account}
				totalLevs={this.state.totalLevs}
				totalLevBlocks={this.state.totalLevBlocks}
				weiPerFee={this.state.weiPerFee}
				feeForThisPeriod={this.state.feeForThisPeriod}
				tokenid={this.state.tokenid}
				startBlock={this.state.startBlock}
				expiryBlock={this.state.expiryBlock}
				currentPeriod={this.state.currentPeriod}
				owner={this.state.owner}
				wallet={this.state.wallet}
				feeTokenId={this.state.feeTokenId}
				weiAsFee={this.state.weiAsFee}
				feeCalculated={this.state.feeCalculated}
			/>
      </div>
    )
  }
}

class Actions extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div>
				<h2>Actions</h2>

				<p>Check allowance: </p><button disabled={this.props.isUpdatingAllowance ? true : false} onClick={async () => {
					this.setState({ isUpdatingAllowance: true });
					await this.updateAllowance();
					this.setState({ isUpdatingAllowance: false })
				}}>Allowance</button> <span>{this.props.allowance}</span><br/>

				<p>Set custom account: </p>
				<input type="text" ref="custom-account" onChange={() => {
					this.setState({customAccount: this.refs['custom-account'].value})
				}}/>&nbsp;
				<button onClick={() => {
					this.setState({customAccount: this.refs['custom-account'].value})
				}}>Set {this.props.customAccount} custom account</button><br/>

				<p>Approve tokens to Stake.sol: </p>
				<input type="number" ref="approve-amount" onChange={() => {
					this.setState({approveAmount: this.refs['approve-amount'].value})
				}}/>&nbsp;
				<button onClick={() => {
					this.approve(this.props.approveAmount)
				}}>Approve {this.props.approveAmount} LEV</button><br/>

				<p>Stake tokens: </p>
				<input type="number" ref="stake-amount" onChange={() => {
					this.setState({stakeAmount: this.refs['stake-amount'].value})
				}}/>&nbsp;
				<button onClick={() => {
					this.stakeTokens(this.props.stakeAmount)
				}}>Stake now {this.props.stakeAmount} LEVs</button><br/>
			</div>
		)
	}
}

class Stake extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className={this.props.classStake}>
				<h2>Stake Smart Contract</h2>
				<button disabled={this.props.isUpdatingStakeData ? true : false} onClick={async () => {
					this.props.setState({ isUpdatingStakeData: true });
					await this.props.updateStakeData();
					this.props.setState({ isUpdatingStakeData: false })
				}}>Update stake data</button>
				<br/>
				<p>Account: </p><span>{this.props.account}</span><br/>
				<p>Total levs: </p><span>{this.props.totalLevs}</span><br/>
				<p>Total lev blocks: </p><span>{this.props.totalLevBlocks}</span><br/>
				<p>Wei per fee: </p><span>{this.props.weiPerFee}</span><br/>
				<p>Fee for this period: </p><span>{this.props.feeForThisPeriod}</span><br/>
				<p>Lev token address: </p><span>{this.props.tokenid}</span><br/>
				<p>Start block: </p><span>{this.props.startBlock}</span><br/>
				<p>Expiry block: </p><span>{this.props.expiryBlock}</span><br/>
				<p>Current period: </p><span>{this.props.currentPeriod}</span><br/>
				<p>Owner: </p><span>{this.props.owner}</span><br/>
				<p>Wallet: </p><span>{this.props.wallet}</span><br/>
				<p>Fee token ID: </p><span>{this.props.feeTokenId}</span><br/>
				<p>Wei as Fee: </p><span>{this.props.weiAsFee}</span><br/>
				<p>Fee calculated: </p><span>{this.props.feeCalculated}</span><br/>
			</div>
		)
	}
}

class StakeBox extends React.Component {
	constructor(props) {
		super(props)
	}

	render() {
		return (
			<div className={this.props.showTransactionFields ? 'contract-data bordered' : 'hidden'} onClick={() => {
				this.props.setState({showTransactionFields: false})
			}}>
				<i className="centered">Click to close</i><br/>
				<p>Send to address: </p><span>{this.props.transactionFieldsTo}</span><br/>
				<p>Send amount: </p><span>{this.props.transactionFieldsAmount}</span><br/>
				<p>Send gas limit: </p><span>{this.props.transactionFieldsGasLimit}</span><br/>
				<p>Send data: </p><span>{this.props.transactionFieldsData}</span><br/>
			</div>
		)
	}
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
);
