/**
  * stake users levs
  * get fee from trading contract
  * get eth from trading contract
  * calculate fee tokens to be generated
  * distribute fee tokens and lev to users in chunks.
  * re-purpose it for next trading duration.
  * what happens to extra fee if not enough trading happened? destroy it.
  * Stake will have full control over FEE.sol
  */
pragma solidity ^0.4.18;


import './SafeMath.sol';
import './Owned.sol';
import './Validated.sol';
import './Token.sol';
import './Fee.sol';


contract Stake is Owned, Validated {
  using SafeMath for uint256;

  //fixme: index action? or have distinct events?
  event StakeEvent(address indexed user, uint256 levs, string action, uint256 startBlock, uint256 endBlock);

  // User address to (lev tokens)*(blocks left to end)
  mapping (address => uint256) public levBlocks;

  // User address to lev tokens at stake
  mapping (address => uint256) public stakes;

  // fixme: total lev tokens. This may not be required ... use or delete
  uint256 public totalLevs;

  // Total lev blocks. this will be help not to iterate through full mapping
  uint256 public totalLevBlocks;

  // Wei for each Fee token
  uint256 public weiPerFee;

  // Total fee to be distributed
  uint256 public feeForTheStakingInterval;

  // Lev token reference
  Token public levToken;

  // FEE token reference
  Fee public feeToken;

  uint256 public startBlock;

  uint256 public endBlock;

  // fixme: not really used ... use or delete
  uint public currentStakingInterval;

  address public wallet;

  // fixme: not really used ... use or delete
  // Wei owned by the contract
  uint256 public weiAsFee;

  bool public feeCalculated = false;

  modifier isStaking {
    require(startBlock <= block.number && block.number < endBlock);
    _;
  }

  modifier isDoneStaking {
    require(block.number >= endBlock);
    _;
  }

  function() public payable {
    //        weiAsFee = weiAsFee.add(msg.value);
  }

  /// @notice Constructor to set all the default values for the owner, wallet,
  /// weiPerFee, tokenID and endBlock
  function Stake(
    address _owner,
    address _wallet,
    uint256 _weiPerFee,
    address _levToken
  ) public
    addressNotEmpty(_wallet)
    addressNotEmpty(_owner)
    addressNotEmpty(_levToken)
    numberNotZero(_weiPerFee)
  {
    owner = _owner;
    wallet = _wallet;
    weiPerFee = _weiPerFee;
    setLevToken(_levToken);
  }

  function version() external constant returns (string) {
    return "1.0.0";
  }

  /// @notice To set the the address of the LEV token
  /// @param _levToken The token address
  function setLevToken(address _levToken) external addressNotEmpty(_levToken) onlyOwner {
    levToken = Token(_tokenId);
  }

  /// @notice To set the FEE token address
  /// @param _feeToken The address of that token
  function setFeeToken(address _feeToken) external addressNotEmpty(_feeToken) onlyOwner {
    feeToken = Fee(_tokenId);
  }

  /// @notice To set the wallet address by the owner only
  /// @param _wallet The wallet address
  function setWallet(address _wallet)
    external
    addressNotEmpty(_wallet)
    onlyOwner
    returns (bool)
  {
    wallet = _wallet;
    return true;
  }

  /// @notice Public function to stake tokens executable by any user. The user
  /// has to approve the staking contract on token before calling this function.
  /// Refer to the tests for more information
  /// @param _quantity How many LEV tokens to lock for staking
  function stakeTokens(uint256 _quantity)
    public
    isStaking
    numberNotZero(_quantity)
    returns (bool result)
  {
    require(levToken.balanceOf(msg.sender) >= _quantity);

    levBlocks[msg.sender] = SafeMath.add(levBlocks[msg.sender], SafeMath.mul(_quantity, SafeMath.sub(endBlock, block.number)));
    stakes[msg.sender] = SafeMath.add(stakes[msg.sender], _quantity);
    totalLevBlocks = SafeMath.add(totalLevBlocks, SafeMath.mul(_quantity, SafeMath.sub(endBlock, block.number)));
    totalLevs = SafeMath.add(totalLevs, _quantity);
    require(levToken.transferFrom(msg.sender, this, _quantity));
    StakeEvent(msg.sender, _quantity, 'STAKED', startBlock, endBlock);
    return true;
  }

  /// @notice To update the price of FEE tokens to the current value. Executable
  /// by the owner only
  function updateFeeForCurrentStakingInterval() public onlyOwner isDoneStaking returns (bool result) {
    require(feeCalculated == false);

    uint256 feeFromExchange = feeToken.balanceOf(this);
    feeForTheStakingInterval = SafeMath.add(feeFromExchange, SafeMath.div(this.balance, weiPerFee));
    feeCalculated = true;
    require(feeToken.burnTokens(feeFromExchange));
    wallet.transfer(this.balance);
    weiAsFee = 0;
    return true;
  }

  /// @notice To unlock and recover your LEV and FEE tokens after staking
  /// and fee to any user
  function redeemLevAndFee() public returns (bool) {
    return redeemLevAndFeeInternal(msg.sender);
  }

  function sendLevAndFeeToUsers(address[] _users) public onlyOwner returns (bool) {
    for (uint i = 0; i < _users.length; i++) redeemLevAndFeeInternal(_users[i]);
    return true;
  }

  function redeemLevAndFeeInternal(address _user)
    internal //fixme: why internal? should be private (as there are no subclasses)
    addressNotEmpty(_user)
    isDoneStaking
    returns (bool)
  {
    require(feeCalculated);
    require(totalLevBlocks > 0);
    uint256 levBlock = levBlocks[_user];
    uint256 stake = stakes[_user];
    require(stake > 0);
    uint256 feeEarned = SafeMath.div(SafeMath.mul(levBlock, feeForTheStakingInterval), totalLevBlocks);
    delete stakes[_user];
    delete levBlocks[_user];
    totalLevs = SafeMath.sub(totalLevs, stake);
    if (feeEarned > 0) require(feeToken.sendTokens(_user, feeEarned));
    require(levToken.transfer(_user, stake));
    StakeEvent(_user, stake, 'CLAIMED', startBlock, endBlock);
    return true;
  }

  /// @notice To start a new trading staking-interval where the price of the FEE will be updated
  /// @param _start The starting block.number of the new staking-interval
  /// @param _end When the new staking-interval ends in block.number
  function startNewStakingInterval(uint256 _start, uint256 _end)
    external
    numberNotZero(_start)
    numberNotZero(_end)
    onlyOwner
    isDoneStaking
    returns (bool result)
  {
    require(totalLevs == 0);
    startBlock = _start;
    endBlock = _end;
    totalLevBlocks = 0;
    feeForTheStakingInterval = 0;
    weiAsFee = 0;
    feeCalculated = false;
    return true;
  }

  /// @notice To get how many LEV blocks has an address
  /// @param _for The owner of the blocks
  function getLevBlocks(address _for) public constant returns (uint256 levBlock) {
    return levBlocks[_for];
  }

  /// @notice To get how many LEV blocks has an address
  /// @param _for The owner of the blocks
  function getStakes(address _for) public constant returns (uint256 stake) {
    return stakes[_for];
  }
}
