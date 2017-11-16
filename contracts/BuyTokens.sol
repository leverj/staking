pragma solidity ^0.4.15;

import './Token.sol';

contract BuyTokens {
  Token public token;

  function setToken(address _token) public {
    token = Token(_token);
  }

  function () public payable {
    token.transfer(msg.sender, msg.value * 1000);
  }
}
