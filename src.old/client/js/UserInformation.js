import React from 'react'
import ReactDOM from 'react-dom'
import Tooltip from './Tooltip'

class UserInformation extends React.Component {
	render() {
		const {className, approvedLev, numberOfLev, stakedLev, feeToWithdraw, levToWithdraw, account} = this.props
		return (
			<div className={className}>
				<div className="row">
					<h2>User Information</h2>
				</div>

				<br/>

				<div className="row align-items-center">
					<div className="col-11 input-group">
						<input className="form-control" type="text" placeholder="Ethereum address..." ref="custom-account" />
						<span className="input-group-btn">
							<button className="btn btn-secondary" type="button" onClick={() => {
								this.props.getInfo(this.refs['custom-account'].value)
							}}>Get Info</button><br/>
						</span>
					</div>
					<div className="col-1 left-padding-zero">
						<Tooltip position="top" message="You'll see your LEV information once you set up your account here" />
					</div>
				</div>

				<br/>

				<div className={account ? "row" : 'hidden'}>
					<p className="col-12">Showing data for the account: {account}</p>
				</div>

				<div className="row">
					<p className="col-12">Number of LEV: {numberOfLev}</p>
				</div>

				<div className="row">
					<p className="col-12">Staked LEV: {stakedLev}</p>
				</div>

				<div className="row">
					<p className="col-12">Approved LEV: {approvedLev}</p>
				</div>

				<div className="row">
					<p className="col-12">LEV available to withdraw: {levToWithdraw}</p>
				</div>

				<div className="row">
					<p className="col-12">FEE available to withdraw: {feeToWithdraw}</p>
				</div>
			</div>
		)
	}
}

export default UserInformation
