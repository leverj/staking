pragma solidity ^0.4.24;

contract Mock {

    mapping(address=>address) public keys;
    function sendFunds(address recipient) public payable {
        require(recipient.send(msg.value), "Transfer failed");
    }

    function registerKey(address key) public{
        keys[msg.sender] = key;
    }

}