# Findings


### Minor

- **Explicit UINT256 vs UINT**<br>
It is better to use explicit uint256 declaration than uint (which is alias for uint256) just to increase clarity and mark the intention to use uint256. Lines: [35](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L35)

- **Differentiate functions and events**<br>
Favor capitalization and a prefix in front of events (we suggest Log), to prevent the risk of confusion between functions and events Lines: [24](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L24)

- **Lock pragma to specific compiler version**<br>
It is better to lock and stick to a chosen compiler version and fully test it before go live. Lines: [11](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L11) etc

- **Suggest add event log in fallback function**<br>
According to the best practice, it is always better to put a event log in fallback functions to record who sent ETH to this contract. Lines: [70](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L70)

- **Consider to Check overflow**<br>
It is safer to check overflow all the time. Consider to avoid assumptions that your variables are safe.
```require(balances[msg.sender] >= _value && balances[_to] + _value > balances[_to]);``` Lines: [20](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/StandardToken.sol#L19)

### Moderate

- **startNewStakingInterval can be called with a startBlock later than endBlock**<br>
There is a possibility to prevent staking for one staking period if the end block is lesser than start block. Lines: [181](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L181)

- **Favor pull over push**<br>
The Operator can initiate redeeming for stakers. It use `require()` and if one transaction fails, all other transactions fail. Probably it is better to shift that responsibilities out of blockchain (to the backend for example). Backend could perform all checks and then initiate redeems by calling `redeemLevAndFeeByStaker()` function. Lines: [152](https://github.com/BlockchainLabsNZ/staking/blob/master/contracts/Stake.sol#L152)

