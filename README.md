# LEV Stake Contract

Staking contract enables LEV token holders to stake their LEV tokens for specific period of  time for gaining FEE tokens.

1) User approves token transfer to staking contract. `levToken.approve(StakecontractAddress, quantity)`
2) User transfers LEV tokens to be staked. `stakeContract.stakeTokens(quantity)`
3) wait for stake period to get over. During this period stake contract may receive Ethers and FEE tokens. 
4) Operator calculates how much FEE tokens generated during this period and transfer all Ethers collected to wallet address of exchange. `stakecontract.updateFeeForCurrentStakingInterval()`
5) Operator distributes FEE tokens and collected LEV tokens to users. `stakecontracct.redeemLevAndFeeToStakers()` 
6) There is also provision for user to get their tokens and ethers. `stakecontracct.redeemLevAndFeeByStaker()`
7) Operator starts a new staking period for users to stake LEV. `stakecontracct.startNewStakingInterval(start, end)`


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
