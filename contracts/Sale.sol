pragma solidity ^0.4.0;


import "./HumanStandardToken.sol";


contract Sale {
  address public owner;

  uint256 tokenSupply = 1000000000000000000;

  string tokenName = "LEV";

  uint8 tokenDecimals = 9;

  string tokenSymbol = "LEV";

  uint price = 100000;

  HumanStandardToken public token ;

  function changeOwner(address _owner) public {
    require(msg.sender == owner);
    owner = _owner;
  }

  function Sale(){
    owner = msg.sender;
    token = new HumanStandardToken(tokenSupply, tokenName, tokenDecimals, tokenSymbol);
    token.transfer(this, token.totalSupply());
  }

  function() public payable {
    token.transfer(msg.sender, msg.value / price);
    owner.transfer(msg.value);
  }

}
