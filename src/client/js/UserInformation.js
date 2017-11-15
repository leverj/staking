import React from 'react'

class UserInformation extends React.Component {
	render() {
		const {classStake, approvedLev, numberOfLev, stakedLev} = this.props
		return (
			<div className={classStake}>
				<h2>User Information</h2>

				<div>
					<p className="inline">Enter address: </p>&nbsp;
					<input type="text" ref="custom-account" />&nbsp;
					<button onClick={() => {
						this.props.getInfo(this.refs['custom-account'].value)
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

export default UserInformation
