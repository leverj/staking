pragma solidity ^0.4.18;


contract Owned {

  // owner address to enable admin functions
  address public owner;

  modifier stringNotEmpty(string _string) {
    require(bytes(_string).length != 0);
    _;
  }

  function setOwner(address _owner) external onlyOwner addressNotEmpty(_owner) returns (bool) {
    owner = _owner;
    return true;
  }

}
