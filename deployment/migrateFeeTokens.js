let affirm = require('affirm.js');

module.exports = function () {
  const migration = {}
  let web3, previousFee, newFee, previousFeeAddress, newFeeAddress, abi, deploymentUtil

  migration.migrate = async function migrate(_previousFeeAddress, _newFeeAddress, _abi, _deploymentUtil) {
    affirm(_deploymentUtil, 'provide _deploymentUtil')
    web3 = _deploymentUtil.web3()
    affirm(web3.utils.isAddress(_previousFeeAddress), 'Invalid previous address')
    affirm(web3.utils.isAddress(_newFeeAddress), 'Invalid new address')
    affirm(_abi, 'Invalid _abi')
    previousFeeAddress      = _previousFeeAddress
    newFeeAddress           = _newFeeAddress
    abi                     = _abi
    deploymentUtil          = _deploymentUtil
    previousFee             = new web3.eth.Contract(_abi, _previousFeeAddress)
    newFee                  = new web3.eth.Contract(_abi, _newFeeAddress)
    let recipientAddressMap = await getTokenRecipient()
    console.log('setting deployer as minter')
    await deploymentUtil.sendTx(newFee, newFee.methods.setMinter(deploymentUtil.getDeployer().address))

    let recipientAddresses = Object.keys(recipientAddressMap);
    for (let i = 0; i < recipientAddresses.length; i++) {
      let recipientAddress = recipientAddresses[i];
      let tokenBalance = await newFee.methods.balanceOf(recipientAddress).call()
      if(tokenBalance === recipientAddressMap[recipientAddress]) continue
      console.log(`sending ${recipientAddressMap[recipientAddress]} FEE to ${recipientAddress}`)
      await _deploymentUtil.sendTx(newFee, newFee.methods.sendTokens(recipientAddress, recipientAddressMap[recipientAddress]))
    }
  }

  async function getTokenRecipient() {
    let events    = await previousFee.getPastEvents('Transfer', {fromBlock: 0, toBlock: 'latest'})
    let addresses = {}
    for (let i = 0; i < events.length; i++) {
      let to = events[i].returnValues._to;
      if (addresses[to]) return
      addresses[to] = await previousFee.methods.balanceOf(to).call()
    }
    return addresses
  }

  return migration
}
