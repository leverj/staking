`staking-contracts-audit/contracts/Fee.sol`

_Well documented, class variables have clear explanations and example values. Nice use of modifiers for validation. Uses SafeMath where appropriate. The function `sendTokens` has a slightly confusing name since it's used to mint tokens, however the usage is explained clearly in a docstring and it can't be called by end users._

| Contract | Function                         | Visibility | Constant | Returns | Modifiers                       | Static Analysis    | Test Coverage      | Functional Analysis |
|:---------|:---------------------------------|:-----------|:---------|:--------|:--------------------------------|:-------------------|:-------------------|:--------------------|
| Fee      | Fee(address,string,uint8,string) | public     | false    |         | notEmpty,notEmpty               | :white_check_mark: | :white_check_mark: |                     |
| Fee      | setMinter(address)               | external   | false    |         | onlyOwner,validAddress          | :white_check_mark: | :white_check_mark: |                     |
| Fee      | burnTokens(uint)                 | public     | false    |         | notZero                         | :white_check_mark: | :white_check_mark: |                     |
| Fee      | sendTokens(address,uint)         | public     | false    |         | onlyMinter,validAddress,notZero | :white_check_mark: | :white_check_mark: |                     |

`staking-contracts-audit/contracts/HumanStandardToken.sol`

_Well documented again, good explanations on all functions and variables. The compiler version is out of date. This contract is only for testing purposes so it doesn't pose a security threat to the project in any way._

| Contract           | Function                                        | Visibility | Constant | Returns | Modifiers | Static Analysis    | Test Coverage      | Functional Analysis |
|:-------------------|:------------------------------------------------|:-----------|:---------|:--------|:----------|:-------------------|:-------------------|:--------------------|
| HumanStandardToken | HumanStandardToken(uint256,string,uint8,string) | public     | false    |         |           | :white_check_mark: | :white_check_mark: |                     |
| HumanStandardToken | approveAndCall(address,uint256,bytes)           | public     | false    | success |           | :white_check_mark: | :white_check_mark: |                     |


`staking-contracts-audit/contracts/Migrations.sol`

_Standard Truffle migrations contract_

| Contract   | Function           | Visibility | Constant | Returns | Modifiers  | Static Analysis    |
|:-----------|:-------------------|:-----------|:---------|:--------|:-----------|:-------------------|
| Migrations | Migrations()       | public     | false    |         |            | :white_check_mark: |
| Migrations | setCompleted(uint) | public     | false    |         | restricted | :white_check_mark: |
| Migrations | upgrade(address)   | public     | false    |         | restricted | :white_check_mark: |


`staking-contracts-audit/contracts/Owned.sol`

_Fairly standard implementation of a basic owner/permission contract. Functions are self-explanatory and do what they're named. Consider adding an event for when an `operator` is set._

| Contract | Function             | Visibility | Constant | Returns | Modifiers | Static Analysis    | Test Coverage      | Functional Analysis |
|:---------|:---------------------|:-----------|:---------|:--------|:----------|:-------------------|:-------------------|:--------------------|
| Owned    | setOperator(address) | external   | false    |         | onlyOwner | :white_check_mark: |                    |                     |
| Owned    | removeOwner(address) | public     | false    |         | onlyOwner | :white_check_mark: | :white_check_mark: |                     |
| Owned    | addOwner(address)    | external   | false    |         | onlyOwner | :white_check_mark: | :white_check_mark: |                     |
| Owned    | setOwners(address)   | internal   | false    |         |           | :white_check_mark: |                    |                     |
| Owned    | getOwners()          | public     | true     |         |           | :white_check_mark: | :white_check_mark: |                     |

`staking-contracts-audit/contracts/Stake.sol`

_This is where the bulk of the project exists, functions and variables are mostly documented well. There are a couple of functions and variables that could do with some more documentation or more descriptive variables names._

| Contract | Function                                    | Visibility | Constant | Returns | Modifiers                                      | Static Analysis    | Test Coverage | Functional Analysis |
|:---------|:--------------------------------------------|:-----------|:---------|:--------|:-----------------------------------------------|:-------------------|:--------------|:--------------------|
| Stake    | ()                                          | public     | false    |         | payable                                        | :white_check_mark: |               |                     |
| Stake    | Stake(address,address,address,uint,address) | public     | false    |         | validAddress,validAddress,validAddress,notZero | :white_check_mark: |               |                     |
| Stake    | version()                                   | external   | false    | string  | pure                                           | :white_check_mark: |               |                     |
| Stake    | setLevToken(address)                        | external   | false    |         | validAddress,onlyOwner                         | :white_check_mark: |               |                     |
| Stake    | setFeeToken(address)                        | external   | false    |         | validAddress,onlyOwner                         | :white_check_mark: |               |                     |
| Stake    | setWallet(address)                          | external   | false    |         | validAddress,onlyOwner                         | :white_check_mark: |               |                     |
| Stake    | stakeTokens(uint)                           | external   | false    |         | isStaking,notZero                              | :white_check_mark  |               |                     |
| Stake    | revertFeeCalculatedFlag(bool)               | external   | false    |         | onlyOwner,isDoneStaking                        | :white_check_mark: |               |                     |
| Stake    | updateFeeForCurrentStakingInterval()        | external   | false    |         | onlyOperator,isDoneStaking                     | :white_check_mark: |               |                     |
| Stake    | redeemLevAndFeeByStaker()                   | external   | false    |         |                                                | :white_check_mark: |               |                     |
| Stake    | redeemLevAndFeeToStakers(address)           | external   | false    |         | onlyOperator                                   | :white_check_mark: |               |                     |
| Stake    | redeemLevAndFee(address)                    | private    | false    |         | validAddress,isDoneStaking                     | :white_check_mark: |               |                     |
| Stake    | startNewStakingInterval(uint,uint)          | external   | false    |         | notZero,notZero,onlyOperator,isDoneStaking     | :white_check_mark: |               |                     |

`staking-contracts-audit/contracts/StandardToken.sol`

_Basic ERC20 Token contract, only implements the core of ERC20. This should be updated to protect against overflowing balances for use with Fee.sol_

| Contract      | Function                              | Visibility | Constant | Returns   | Modifiers | Static Analysis    | Test Coverage | Functional Analysis |
|:--------------|:--------------------------------------|:-----------|:---------|:----------|:----------|:-------------------|:--------------|:--------------------|
| StandardToken | transfer(address,uint256)             | public     | false    | success   |           | :white_check_mark: |               |                     |
| StandardToken | transferFrom(address,address,uint256) | public     | false    | success   |           | :white_check_mark: |               |                     |
| StandardToken | balanceOf(address)                    | public     | true     | balance   |           | :white_check_mark: |               |                     |
| StandardToken | approve(address,uint256)              | public     | false    | success   |           | :white_check_mark: |               |                     |
| StandardToken | allowance(address,address)            | public     | true     | remaining |           | :white_check_mark: |               |                     |

