pragma solidity ^0.4.19;


contract GenericCall {

  /************************************ abstract **********************************/
  modifier isAllowed {_;}
  /********************************************************************************/

  event Execution(address destination, uint value, bytes data);

  function execute(address destination, uint value, bytes data) external isAllowed {
    if (destination.call.value(value)(data)) {
      Execution(destination, value, data);
    }
  }
}
