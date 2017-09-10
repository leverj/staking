pragma solidity ^0.4.11;
import "tokens/HumanStandardToken.sol";

contract Stake {


    event TokenStakeEvent(address indexed purchaser, uint amount);

    struct TokenStake {
        address beneficiary;
        uint256 quantity;
        uint    blockNumber;
    }

    HumanStandardToken public token;
    uint public freezeBlock;
    address public levid;
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

    function Stake(address _owner, address _levid, uint _freezeBlock){
        levid = _levid;
        freezeBlock = _freezeBlock;
        owner = _owner;
        token = HumanStandardToken(_levid);
    }

    function stakeTokens(uint256 _quantity) notFrozen returns (bool){
        require(token.balanceOf(msg.sender) >= _quantity);
        tokenSales[counter] = TokenStake(msg.sender, _quantity, block.number);
        bool result = levid.delegatecall(bytes4(sha3("transfer(uint256)")), _quantity);
        return result;
    }

    // when fees is received.
    function() payable  {
//        address user = msg.sender;
//        uint256 qty = msg.value;
//        tokenSales[counter] = TokenStake(msg.sender, msg.value, block.number);
//        counter++;
//        TokenStakeEvent(user, msg.value);
    }
}