`staking-contracts-audit/contracts/Fee.sol`

_Well documented, class variables have clear explanations and example values. Nice use of modifiers for validation. Uses SafeMath where appropriate. The function `sendTokens` has a slightly confusing name since it's used to mint tokens, however the usage is explained clearly in a docstring and it can't be called by end users._

| Contract | Function                         | Visibility | Constant | Returns | Modifiers                       | Static Analysis    | Test Coverage      | Functional Analysis |
|:---------|:---------------------------------|:-----------|:---------|:--------|:--------------------------------|:-------------------|:-------------------|:--------------------|
| Fee      | Fee(address,string,uint8,string) | public     | false    |         | notEmpty,notEmpty               | :white_check_mark: | :white_check_mark: |                     |
| Fee      | setMinter(address)               | external   | false    |         | onlyOwner,validAddress          | :white_check_mark: | :white_check_mark: |                     |
| Fee      | burnTokens(uint)                 | public     | false    |         | notZero                         | :white_check_mark: | :white_check_mark: |                     |
| Fee      | sendTokens(address,uint)         | public     | false    |         | onlyMinter,validAddress,notZero | :white_check_mark: | :white_check_mark: |                     |

`staking-contracts-audit/contracts/HumanStandardToken.sol`

| Contract           | Function                                        | Visibility | Constant | Returns | Modifiers | Static Analysis | Test Coverage | Functional Analysis |
|:-------------------|:------------------------------------------------|:-----------|:---------|:--------|:----------|:----------------|:--------------|:--------------------|
| HumanStandardToken | HumanStandardToken(uint256,string,uint8,string) | public     | false    |         |           |                 |               |                     |
| HumanStandardToken | approveAndCall(address,uint256,bytes)           | public     | false    | success |           |                 |               |                     |


`staking-contracts-audit/contracts/Migrations.sol`


| Contract   | Function           | Visibility | Constant | Returns | Modifiers  | Static Analysis | Test Coverage | Functional Analysis |
|:-----------|:-------------------|:-----------|:---------|:--------|:-----------|:----------------|:--------------|:--------------------|
| Migrations | Migrations()       | public     | false    |         |            |                 |               |                     |
| Migrations | setCompleted(uint) | public     | false    |         | restricted |                 |               |                     |
| Migrations | upgrade(address)   | public     | false    |         | restricted |                 |               |                     |


`staking-contracts-audit/contracts/Owned.sol`

| Contract | Function             | Visibility | Constant | Returns | Modifiers | Static Analysis | Test Coverage | Functional Analysis |
|:---------|:---------------------|:-----------|:---------|:--------|:----------|:----------------|:--------------|:--------------------|
| Owned    | setOperator(address) | external   | false    |         | onlyOwner |                 |               |                     |
| Owned    | removeOwner(address) | public     | false    |         | onlyOwner |                 |               |                     |
| Owned    | addOwner(address)    | external   | false    |         | onlyOwner |                 |               |                     |
| Owned    | setOwners(address)   | internal   | false    |         |           |                 |               |                     |
| Owned    | getOwners()          | public     | true     |         |           |                 |               |                     |

`staking-contracts-audit/contracts/Stake.sol`

| Contract | Function                                    | Visibility | Constant | Returns | Modifiers                                      | Static Analysis | Test Coverage | Functional Analysis |
|:---------|:--------------------------------------------|:-----------|:---------|:--------|:-----------------------------------------------|:----------------|:--------------|:--------------------|
| Stake    | ()                                          | public     | false    |         | payable                                        |                 |               |                     |
| Stake    | Stake(address,address,address,uint,address) | public     | false    |         | validAddress,validAddress,validAddress,notZero |                 |               |                     |
| Stake    | version()                                   | external   | false    | string  | pure                                           |                 |               |                     |
| Stake    | setLevToken(address)                        | external   | false    |         | validAddress,onlyOwner                         |                 |               |                     |
| Stake    | setFeeToken(address)                        | external   | false    |         | validAddress,onlyOwner                         |                 |               |                     |
| Stake    | setWallet(address)                          | external   | false    |         | validAddress,onlyOwner                         |                 |               |                     |
| Stake    | stakeTokens(uint)                           | external   | false    |         | isStaking,notZero                              |                 |               |                     |
| Stake    | revertFeeCalculatedFlag(bool)               | external   | false    |         | onlyOwner,isDoneStaking                        |                 |               |                     |
| Stake    | updateFeeForCurrentStakingInterval()        | external   | false    |         | onlyOperator,isDoneStaking                     |                 |               |                     |
| Stake    | redeemLevAndFeeByStaker()                   | external   | false    |         |                                                |                 |               |                     |
| Stake    | redeemLevAndFeeToStakers(address)           | external   | false    |         | onlyOperator                                   |                 |               |                     |
| Stake    | redeemLevAndFee(address)                    | private    | false    |         | validAddress,isDoneStaking                     |                 |               |                     |
| Stake    | startNewStakingInterval(uint,uint)          | external   | false    |         | notZero,notZero,onlyOperator,isDoneStaking     |                 |               |                     |

`staking-contracts-audit/contracts/StandardToken.sol`

| Contract      | Function                              | Visibility | Constant | Returns   | Modifiers | Static Analysis | Test Coverage | Functional Analysis |
|:--------------|:--------------------------------------|:-----------|:---------|:----------|:----------|:----------------|:--------------|:--------------------|
| StandardToken | transfer(address,uint256)             | public     | false    | success   |           |                 |               |                     |
| StandardToken | transferFrom(address,address,uint256) | public     | false    | success   |           |                 |               |                     |
| StandardToken | balanceOf(address)                    | public     | true     | balance   |           |                 |               |                     |
| StandardToken | approve(address,uint256)              | public     | false    | success   |           |                 |               |                     |
| StandardToken | allowance(address,address)            | public     | true     | remaining |           |                 |               |                     |

