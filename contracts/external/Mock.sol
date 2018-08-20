pragma solidity ^0.4.24;

contract Mock {

    function sendFunds(address recipient) public payable {
        require(recipient.send(msg.value), "Transfer failed");
    }


}