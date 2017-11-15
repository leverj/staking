pragma solidity ^0.4.18;


contract Validated {

  modifier addressNotEmpty(address _address) {
    require(_address != address(0));
    _;
  }

  modifier numberNotZero(uint256 _number) {
    require(_number != 0);
    _;
  }

  modifier stringNotEmpty(string _string) {
    require(bytes(_string).length != 0);
    _;
  }

}
