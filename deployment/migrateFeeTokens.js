let affirm = require('affirm.js');

module.exports = function () {
  const migration = {}
  let web3, previousFee, newFee, previousFeeAddress, newFeeAddress, abi, deploymentUtil

  migration.migrate = async function migrate(_previousFeeAddress, _newFeeAddress, _abi, _deploymentUtil) {
    if(!_previousFeeAddress) return
    affirm(_deploymentUtil, 'provide _deploymentUtil')
    web3 = _deploymentUtil.web3()
    affirm(web3.utils.isAddress(_previousFeeAddress), 'Invalid previous address')
    affirm(web3.utils.isAddress(_newFeeAddress), 'Invalid new address')
    affirm(_abi, 'Invalid _abi')
    previousFeeAddress = _previousFeeAddress
    newFeeAddress      = _newFeeAddress
    abi                = _abi
    deploymentUtil     = _deploymentUtil
    previousFee        = new web3.eth.Contract(_abi, _previousFeeAddress)
    newFee             = new web3.eth.Contract(_abi, _newFeeAddress)
    if (await newFee.methods.minter().call() !== deploymentUtil.getDeployer().address) {
      console.log('setting deployer as minter', deploymentUtil.getDeployer().address)
      await deploymentUtil.sendTx(newFee, newFee.methods.setMinter(deploymentUtil.getDeployer().address))
    }
    let recipientAddressToBalance = await getTokenRecipient()
    let recipientAddresses        = Object.keys(recipientAddressToBalance);
    for (let i = 0; i < recipientAddresses.length; i++) {
      let recipientAddress = recipientAddresses[i];
      let tokenBalance     = await newFee.methods.balanceOf(recipientAddress).call()
      if (tokenBalance === recipientAddressToBalance[recipientAddress]) continue
      console.log(`sending ${recipientAddressToBalance[recipientAddress]} FEE to ${recipientAddress}`)
      await _deploymentUtil.sendTx(newFee, newFee.methods.sendTokens(recipientAddress, recipientAddressToBalance[recipientAddress]))
    }
  }

  async function getTokenRecipient() {
    let events             = await previousFee.getPastEvents('Transfer', {fromBlock: 0, toBlock: 'latest'})
    let addressesToBalance = {}
    for (let i = 0; i < events.length; i++) {
      let to = events[i].returnValues._to;
      if (addressesToBalance[to]) continue
      addressesToBalance[to] = await previousFee.methods.balanceOf(to).call()
    }
    return addressesToBalance
  }

  return migration
}
