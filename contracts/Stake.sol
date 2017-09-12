pragma solidity ^0.4.11;


import "tokens/HumanStandardToken.sol";


contract Stake {

//    event TokenStakeEvent(address indexed purchaser, uint amount);

    mapping (address => uint256) public levBlocks;

    HumanStandardToken public token;

    uint public freezeBlock;

    address public tokenid;

    address public owner;

    uint public counter = 0;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier notFrozen{
        require(block.number < freezeBlock);
        _;
    }

    function Stake(address _owner, address _tokenid, uint _freezeBlock){
        tokenid = _tokenid;
        freezeBlock = _freezeBlock;
        owner = _owner;
        token = HumanStandardToken(_tokenid);
    }

    function setToken(address _tokenid) onlyOwner {
        tokenid = _tokenid;
        token = HumanStandardToken(_tokenid);
    }

    function stakeTokens(uint256 _quantity)  returns (bool result){
        require(token.balanceOf(msg.sender) >= _quantity);
        levBlocks[msg.sender] += _quantity * (freezeBlock - block.number);
//        return token.transfer( msg.sender, _quantity);
        return tokenid.delegatecall(bytes4(sha3("transfer(address,uint256)")), this, _quantity);

    }

}