pragma solidity ^0.4.24;


contract GenericCall {

  /************************************ abstract **********************************/
  modifier isAllowed(address destination) {_;}
  /********************************************************************************/

  event Execution(address destination, uint value, bytes data);

  function execute(address destination, uint value, bytes data) external isAllowed(destination) {
    if (destination.call.value(value)(data)) {
      emit Execution(destination, value, data);
    }
  }
}
