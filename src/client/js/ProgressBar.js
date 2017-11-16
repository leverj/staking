import React from 'react'

class ProgressBar extends React.Component {
	componentDidUpdate () {
		this.refs['bar-content'].style.width = this.props.barPercentage + '%'
	}

	render () {
		return (
			<div className={this.props.className}>
				<table>
					<tbody>
						<tr>
							<td>Stake:</td><td>{this.props.stakeAddress}</td>
						</tr>
						<tr>
							<td>LEV:</td><td>{this.props.levAddress}</td>
						</tr>
						<tr>
							<td>FEE:</td><td>{this.props.feeAddress}</td>
						</tr>
					</tbody>
				</table>

				<div className="bar">
					<div className="bar-content" ref="bar-content">{this.props.barPercentage}%</div>
				</div>
				<p className="bar-start-block">Start: {this.props.startBlock}</p>
				<p className="bar-end-block">End: {this.props.endBlock}</p>
			</div>
		)
	}
}

export default ProgressBar
