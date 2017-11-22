import React from 'react'
import Tooltip from './Tooltip'

class Actions extends React.Component {
	render() {
		return (
			<div className={this.props.className}>
				<div className="row">
					<h2 className="col-12">Actions</h2>
				</div>

				<div className="row align-items-center">
					<input className="col-11 form-control" type="number" placeholder="Amount to stake" ref="stakeAmount-amount" onChange={() => {
						this.props.setState({stakeAmount: this.refs['stakeAmount-amount'].value})
					}} disabled={this.props.account ? false : true} />

					<div className="col-1">
						<Tooltip
							position="top"
							message="You need to set you address before being able to stake, do so on the left panel"
						/>
					</div>
				</div>

				<div className="row">
					<button className="col-4 btn btn-secondary" onClick={() => {
						this.props.approve(this.props.stakeAmount)
					}} disabled={this.props.account ? false : true}>Approve</button>

					<button className="col-4 btn btn-secondary offset-4" onClick={() => {
						this.props.stakeTokens(this.props.stakeAmount)
					}} disabled={this.props.account ? false : true}>Stake</button><br/>
				</div>

				<br/>

				<div className="row">
					<p className="col-12">To address: <span>{this.props.transactionFieldsTo}</span></p>
				</div>
				<div className="row">
					<p className="col-12">Amount: <span>{this.props.transactionFieldsAmount}</span></p>
				</div>
				<div className="row">
					<p className="col-12">Gas limit: <span>{this.props.transactionFieldsGasLimit}</span></p>
				</div>
				<div className="row">
					<p className="col-12">Data: <span>{this.props.transactionFieldsData}</span></p>
				</div>
			</div>
		)
	}
}

export default Actions
