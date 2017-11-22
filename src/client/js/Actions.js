import React from 'react'
import Tooltip from './Tooltip'

class Actions extends React.Component {
	constructor () {
		super()

		this.state = {
			activeButton1: false,
			activeButton2: false,
			activeButton3: false,
			activeButton4: false
		}
	}

	changeCopyTextBack (buttonName) {
		setTimeout(() => {
			this.setState({ [buttonName]: false })
		}, 1.1e3)
	}

	copyClipboard (text) {
		$('body').append(`<textarea id="my-textarea">${text}</textarea>`)
		$('#my-textarea').select()
		document.execCommand('copy')
		$('#my-textarea').remove()
	}

	render() {
		return (
			<div className={this.props.className}>
				<div className="row">
					<h2 className="col-12">Actions</h2>
				</div>

				<div className="row align-items-center">
					<input className="col-11 form-control" type="number" placeholder="Amount to stake" ref="stakeAmount-amount" onChange={() => {
						this.props.setStakeAmount({stakeAmount: this.refs['stakeAmount-amount'].value})
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

				<div className="row align-items-center">
					<div className="col-9">
						<p>To address: <span>{this.props.transactionFieldsTo}</span></p>
					</div>
					<div className="col-3 text-center">
						<button className={this.props.showTransactionFields ? "btn btn-secondary" : "hidden"} onClick={() => {
							this.copyClipboard(this.props.transactionFieldsTo)
							this.setState({activeButton1: true})
							this.changeCopyTextBack('activeButton1')
						}}>{this.state.activeButton1 ? 'Copied!' : 'Copy'}</button>
					</div>
				</div>

				<div className="row align-items-center">
					<div className="col-9">
						<p>Amount: <span>{this.props.transactionFieldsAmount}</span></p>
					</div>
					<div className="col-3 text-center">
						<button className={this.props.showTransactionFields ? "btn btn-secondary" : "hidden"} onClick={() => {
							this.copyClipboard(this.props.transactionFieldsAmount)
							this.setState({activeButton2: true})
							this.changeCopyTextBack('activeButton2')
						}}>{this.state.activeButton2 ? 'Copied!' : 'Copy'}</button>
					</div>
				</div>

				<div className="row align-items-center">
					<div className="col-9">
						<p>Gas limit: <span>{this.props.transactionFieldsGasLimit}</span></p>
					</div>
					<div className="col-3 text-center">
						<button className={this.props.showTransactionFields ? "btn btn-secondary" : "hidden"} onClick={() => {
							this.copyClipboard(this.props.transactionFieldsGasLimit)
							this.setState({activeButton3: true})
							this.changeCopyTextBack('activeButton3')
						}}>{this.state.activeButton3 ? 'Copied!' : 'Copy'}</button>
					</div>
				</div>

				<div className="row align-items-center">
					<div className="col-9">
						<p>Data: <span>{this.props.transactionFieldsData}</span></p>
					</div>
					<div className="col-3 text-center">
						<button className={this.props.showTransactionFields ? "btn btn-secondary" : "hidden"} onClick={() => {
							this.copyClipboard(this.props.transactionFieldsData)
							this.setState({activeButton4: true})
							this.changeCopyTextBack('activeButton4')
						}}>{this.state.activeButton4 ? 'Copied!' : 'Copy'}</button>
					</div>
				</div>
			</div>
		)
	}
}

export default Actions
