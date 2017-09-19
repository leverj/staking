pragma solidity ^0.4.11;

import "tokens/HumanStandardToken.sol";


contract Stakeable is HumanStandardToken {


	uint256 stake_start_block;
	uint256 stake_end_block;
	mapping (address => uint256) stakes;

	function stake(uint256 _value)
	sufficientFunds (_value) 
	onStake {
		balances[msg.sender] -= _value;
		stakes[msg.sender] += _value;
	}

	modifier onStake {
		require (block.number >= stake_start_block  && block.number < stake_end_block);
		_;
	}

	modifier sufficientFunds (uint256 _value) {
		require (balances[msg.sender] >= _value);
		_;
	}
}