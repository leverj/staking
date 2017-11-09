import React from 'react'
import ReactDOM from 'react-dom'
import Web3 from 'web3'
import conf from './conf'
import './../css/index.css'

const stakeABI = require("../../build/contracts/Stake.json").abi;

class App extends React.Component {
  constructor () {
    super()

    this.web3 = new Web3(web3.currentProvider || new Web3.providers.HttpProvider(conf.network));
    this.stake = new this.web3.eth.Contract(stakeABI, conf.stake);

    // We use this.state because it updates the view automatically whenever this
    // object changes. This makes everything react to object changes
    this.state = {
      loadingInitialData: true
    }
    this.init(() => {
      this.setState({loadingInitialData: false})
    })
  }

  async init (done) {
    // Use this.setState to change the state object
    this.setState({
      account: (await this.web3.eth.getAccounts())[0],
      totalLevs: await this.stake.methods.totalLevs().call(),
      totalLevBlocks: await this.stake.methods.totalLevBlocks().call(),
      weiPerFee: await this.stake.methods.weiPerFee().call(),
      feeForThePeriod: await this.stake.methods.feeForThePeriod().call(),
      tokenid: await this.stake.methods.tokenid().call(),
      startBlock: await this.stake.methods.startBlock().call(),
      expiryBlock: await this.stake.methods.expiryBlock().call(),
      currentPeriod: await this.stake.methods.currentPeriod().call(),
      owner: await this.stake.methods.owner().call(),
      wallet: await this.stake.methods.wallet().call(),
      feeTokenId: await this.stake.methods.feeTokenId().call(),
      weiAsFee: await this.stake.methods.weiAsFee().call(),
      feeCalculated: await this.stake.methods.feeCalculated().call()
    }, () => {
      done()
    })
  }

  render () {
    return (
      <div>
        <div className={this.state.loadingInitialData ? '' : 'hidden'}>
          <p>Loading initial data, plase wait...</p>
        </div>
        <div className={this.state.loadingInitialData ? 'hidden' : 'contract-data'}>
          <p>Account: </p><span>{this.state.account}</span><br/>
          <p>Total levs: </p><span>{this.state.totalLevs}</span><br/>
          <p>Total lev blocks: </p><span>{this.state.totalLevBlocks}</span><br/>
          <p>Wei per fee: </p><span>{this.state.weiPerFee}</span><br/>
          <p>Fee for this period: </p><span>{this.state.feeForThisPeriod}</span><br/>
          <p>Lev token address: </p><span>{this.state.tokenid}</span><br/>
          <p>Start block: </p><span>{this.state.startBlock}</span><br/>
          <p>Expiry block: </p><span>{this.state.expiryBlock}</span><br/>
          <p>Current period: </p><span>{this.state.currentPeriod}</span><br/>
          <p>Owner: </p><span>{this.state.owner}</span><br/>
          <p>Wallet: </p><span>{this.state.wallet}</span><br/>
          <p>Fee token ID: </p><span>{this.state.feeTokenId}</span><br/>
          <p>Wei as Fee: </p><span>{this.state.weiAsFee}</span><br/>
          <p>Fee calculated: </p><span>{this.state.feeCalculated}</span><br/>
        </div>
      </div>
    )
  }
}

ReactDOM.render(
  <App />,
  document.querySelector('#root')
)
