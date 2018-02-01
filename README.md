# LEV Stake Contract

Staking contract enables LEV token holders to stake their LEV tokens for specific period of  time for gaining FEE tokens.

1) Approve token transfer to staking contract. `levToken.approve(StakecontractAddress, quantity)`
2) Using staking contract transfer LEV tokens to be staked. `stakeContract.stakeTokens(quantity)`
3) wait for stake period to get over. During this period stake contract may receive Ethers and FEE tokens. 
4) Operator will calculate how much FEE tokens will be generated during this period and tranfer all Ethers collected to wallet address of exchange. `stakecontract.updateFeeForCurrentStakingInterval()`
5) Operator distributes FEE tokens and collected LEV tokens to users. `stakecontracct.redeemLevAndFeeToStakers()` 
6) There is also provision for user to get these tokens by there own. `stakecontracct.redeemLevAndFeeByStaker()`
7) Operator starts a new staking period for users to stake LEV.


### Prerequisites:

```
truffle 4.0.1
node 8.8.0
```

### build
```
    npm install
    npm test
```
