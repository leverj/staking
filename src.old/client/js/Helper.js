import React from 'react'

class Helper extends React.Component {
	render () {
		// TODO create a contract that returns LEV after sending ether
		// How do we give people test ether if they don't have metamask?
		return (
			<div>
				<ol>
					<li>First download metamask by going to <a href="https://metamask.io">metamask.io</a> if you don't have it already. It's a chrome and firefox extension to interact with decentralized apps.</li>
					<li>Then create an account in metamask or use your existing one</li>
					<li>Connect to the Ropsten test network to interact with the Smart Contracts without spending real ether. You can do that in metamask by clicking on the icon at the top that says <i>Main Network</i></li>
					<li>Get some test Ether by going to <a href="https://faucet.metamask.io/">faucet.metamask.io</a> and clicking on <i>request 1 ether from faucet</i></li>
					<li>Go back to the dapp and reload the page to be able to use metamask. It's important that you're logged in on the Ropsten test net or it won't work.</li>
					<li>Now that you have test ether, you'll exchange those ether for LEV test tokens. Inside metamask, click on Send, set the Recipient Address to <b>{this.props.sale}</b> and the amount to how many of your test Ether you want to exchange for LEV. After a some minutes you'll receive the LEV tokens and you'll be able to interact with the dApp.</li>
					<li>In the section <i>User Information</i> set your address and click on <i>Get Info</i>. You'll see some basic information about your account right there.</li>
					<li>Then in the input field of the <i>Actions</i> section type how much LEV tokens you want to stake. Click on <i>Approve</i> to allow the Smart Contract to use your tokens for staking.</li>
					<li>Copy those fields to the send information of any wallet like myetherwallet. Inside the <i>Data</i> field you're approve information is encrypted including the amount to approve.</li>
					<li>Finally do the same by setting how many tokens you want to stake in the input field and click on <i>Stake</i>. Then copy those fields to the send information of your wallet.</li>
				</ol>
			</div>
		)
	}
}

export default Helper
