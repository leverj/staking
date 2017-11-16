import React from 'react'
import UserInformation from './UserInformation'
import ProgressBar from './ProgressBar'
import Header from './Header'
import Actions from './Actions'
import StatusBar from "./StatusBar"

class Main extends React.Component {
	render () {
		return (
			<div>
				<Header />

				<ProgressBar
					className={this.props.loadingInitialData ? 'hidden' : 'bar-container'}
					stakeAddress={this.props.stakeAddress}
					levAddress={this.props.levAddress}
					feeAddress={this.props.feeAddress}
					barPercentage={this.props.barPercentage}
					startBlock={this.props.endBlock}
					endBlock={this.props.endBlock}
				/>

				<div className={this.props.loadingInitialData ? '' : 'hidden'}>
					<p>Loading initial data make sure you're on the Ropsten test network, please wait...</p>
				</div>

				<div className={this.props.loadingInitialData ? 'hidden' : 'boxes-container'}>
					<UserInformation
						classStake={this.props.loadingInitialData ? 'hidden' : 'stake'}
						isUpdatingStakeData={this.props.isUpdatingStakeData}
						getInfo={account => {
							this.props.getInfo(account)
						}}
						account={this.props.account}
						numberOfLev={this.props.numberOfLev}
						stakedLev={this.props.stakedLev}
						approvedLev={this.props.approvedLev}
					/>
					<Actions
						className="actions-box"
						setState={props => {
							this.props.setState(props)
						}}
						approve={amount => {
							this.props.approve(amount)
						}}
						stakeTokens={amount => {
							this.props.stakeTokens(amount)
						}}
						transactionFieldsTo={this.props.transactionFieldsTo}
						transactionFieldsAmount={this.props.transactionFieldsAmount}
						transactionFieldsGasLimit={this.props.transactionFieldsGasLimit}
						transactionFieldsData={this.props.transactionFieldsData}
						isUpdatingAllowance={this.props.isUpdatingAllowance}
						allowance={this.props.allowance}
						customAccount={this.props.customAccount}
						stakeAmount={this.props.stakeAmount}
						showTransactionFields={this.props.showTransactionFields}
						account={this.props.account}
					/>
					<StatusBar sale={this.props.sale}	/>
				</div>
			</div>
		)
	}
}

export default Main
