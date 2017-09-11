pragma solidity ^0.4.11;


import "tokens/HumanStandardToken.sol";


contract Stake {


    event TokenStakeEvent(address indexed purchaser, uint amount);

    struct TokenStake {
    address beneficiary;
    uint256 quantity;
    uint blockNumber;
    }

    HumanStandardToken public token;

    uint public freezeBlock;

    address public tokenid;

    address public owner;

    uint public counter = 0;

    mapping (uint => TokenStake) public tokenSales;

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

    function transfer(address stakeaddress, uint256 _quantity) notFrozen returns (bool){
//        require(stakeaddress == this);
        require(token.balanceOf(msg.sender) >= _quantity);
        tokenSales[counter] = TokenStake(msg.sender, _quantity, block.number);
//        token.transfer.delegatecall(this, _quantity);
//        token.transfer(this, _quantity, msg.sender);
//        bool result = tokenid.delegatecall(bytes4(sha3("transfer(address,uint256)")), this, _quantity);
        tokenid.delegatecall(msg.data);
//        return result;
                return true;
    }

    // when fees is received.
    function() payable {
        //        address user = msg.sender;
        //        uint256 qty = msg.value;
        //        tokenSales[counter] = TokenStake(msg.sender, msg.value, block.number);
        //        counter++;
        //        TokenStakeEvent(user, msg.value);
    }
}