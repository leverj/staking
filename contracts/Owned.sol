pragma solidity ^0.4.18;


contract Owned {

  // owner address to enable admin functions
  address public owner;

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }

  function setOwner(address _owner) external onlyOwner returns (bool) {
    require(_owner != address(0));
    owner = _owner;
    return true;
  }

}
