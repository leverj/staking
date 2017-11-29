pragma solidity ^0.4.11;


import "./Disbursement.sol";
import "./SafeMath.sol";
import "./Token.sol";

/**
this contract should be the address for disbursement contract.
It should not allow to disburse any token for a given time "initialLockTime"
lock "50%" of tokens for 10 years.
transfer 50% of tokens to a given address.
*/
contract TokenLock {
  using SafeMath for uint;
  address public owner;

  uint public shortLock;

  uint public longLock;

  uint public shortShare;

  address public levAddress;

  address public disbursement;

  bool public isShortSent = false;

  bool public isLongSent = false;

  modifier onlyOwner{
    require(msg.sender == owner);
    _;
  }

  modifier validAddress(address _address){
    require(_address != 0);
    _;
  }

  function TokenLock(address _owner, uint _shortLock, uint _longLock, uint _shortShare) public {
    require(_owner != 0);
    require(_longLock > _shortLock);
    require(_shortLock > 0);
    owner = _owner;
    shortLock = block.timestamp.add(_shortLock);
    longLock = block.timestamp.add(_longLock);
    shortShare = _shortShare;
  }

  function setup(address _disbursement, address _levToken) public onlyOwner {
    require(_disbursement != address(0));
    require(_levToken != address(0));
    disbursement = _disbursement;
    levAddress = _levToken;
  }

  function changeOwner(address _owner) public onlyOwner validAddress(_owner) {
    owner = _owner;
  }

  function transferShortTermTokens(address _wallet) public onlyOwner {
    require(_wallet != address(0));
    require(now > shortLock);
    require(!isShortSent);

    isShortSent = true;

    // 1. Get how many tokens this contract has with a token instance and check this token balance
    uint256 tokenBalance = Token(levAddress).balanceOf(disbursement);
    uint256 amountToSend = tokenBalance.mul(shortShare).div(100);

    // 2. Transfer those tokens with the _shortShare percentage
    Disbursement(disbursement).withdraw(_wallet, amountToSend);
  }

  function transferLongTermTokens(address _wallet) public onlyOwner {
    require(_wallet != address(0));
    require(now > longLock);
    require(!isLongSent);

    isLongSent = true;

    // 1. Get how many tokens this contract has with a token instance and check this token balance
    uint256 tokenBalance = Token(levAddress).balanceOf(disbursement);

    // 2. Transfer those tokens with the _shortShare percentage
    Disbursement(disbursement).withdraw(_wallet, tokenBalance);
  }
}
