import React from 'react'

class ProgressBar extends React.Component {
	componentDidUpdate () {
		this.refs['bar-content'].style.width = this.props.barPercentage + '%'
	}

	render () {
		return (
			<div className={`container ${this.props.className}`}>
				<br/>

				<div className="row">
					<div className="col-md-1">
						Stake
					</div>
					<div className="col-md-11">
						{this.props.stakeAddress}
					</div>
				</div>

				<br/>

				<div className="row">
					<div className="col-md-1">
						LEV
					</div>
					<div className="col-md-11">
						{this.props.levAddress}
					</div>
				</div>

				<br/>

				<div className="row">
					<div className="col-md-1">
						FEE
					</div>
					<div className="col-md-11">
						{this.props.feeAddress}
					</div>
				</div>

				<br/>

				<div className="row bar no-gutters">
					<div className="bar-content" ref="bar-content">{this.props.barPercentage? this.props.barPercentage.toFixed(2): this.props.barPercentage}%</div>
				</div>

				<div className="row">
					<p className="col-2 bar-start-block">Start: {this.props.startBlock}</p>
					<p className="col-2 offset-8 bar-end-block">End: {this.props.endBlock}</p>
				</div>
			</div>
		)
	}
}

export default ProgressBar
