pragma solidity ^0.4.18;


contract Owned {

  // owner address to enable admin functions
  address public owner;
  address public operator;

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  modifier onlyOperator {
    require(msg.sender == operator);
    _;
  }

  function setOperator(address _operator) external onlyOwner {
    require(_operator != address(0));
    operator = _operator;
  }

  function setOwner(address _owner) external onlyOwner{
    require(_owner != address(0));
    owner = _owner;
  }

}
