import React from 'react'

class Actions extends React.Component {
	render() {
		return (
			<div className={this.props.className}>
				<h2>Actions</h2>

				<div className="actions-stake">
					<p>Amount to stake: &nbsp;</p>
					<input type="number" ref="stakeAmount-amount" onChange={() => {
						this.props.setState({stakeAmount: this.refs['stakeAmount-amount'].value})
					}} disabled={this.props.account ? false : true}
					/>&nbsp;<span className={this.props.account ? 'hidden' : ''}>Set your address to stake</span>

					<br/>

					<button className="approve-button" onClick={() => {
						this.props.approve(this.props.stakeAmount)
					}} disabled={this.props.account ? false : true}>Approve</button>
					<button className="stake-button" onClick={() => {
						this.props.stakeTokens(this.props.stakeAmount)
					}} disabled={this.props.account ? false : true}>Stake</button><br/>
				</div>

				<p>To address: <span>{this.props.transactionFieldsTo}</span></p><br/>
				<p>Amount: <span>{this.props.transactionFieldsAmount}</span></p><br/>
				<p>Gas limit: <span>{this.props.transactionFieldsGasLimit}</span></p><br/>
				<p>Data: </p><span>{this.props.transactionFieldsData}</span><br/>
			</div>
		)
	}
}

export default Actions
