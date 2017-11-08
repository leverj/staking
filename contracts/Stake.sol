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
pragma solidity ^0.4.11;

import './SafeMath.sol';
import './Token.sol';
import './Fee.sol';

contract Stake {
    using SafeMath for uint256;

    event StakeEvent(address indexed _user, uint256 _levs, string action, uint256 startBlock, uint256 expiryBlock);

    // User address to (lev tokens)*(blocks left to expiry)
    mapping (address => uint256) public levBlocks;

    // User address to lev tokens at stake
    mapping (address => uint256) public stakes;

    // Todo: total lev tokens. This may not be required. revisit
    uint256 public totalLevs;

    // Total lev blocks. this will be help not to iterate through full mapping
    uint256 public totalLevBlocks;

    // Wei for each Fee token
    uint256 public weiPerFee;

    // Total fee to be distributed
    uint256 public feeForThePeriod;

    // Lev token reference
    address public tokenid;

    uint256 public startBlock;
    uint256 public expiryBlock;
    uint public currentPeriod;

    // Owner address for admin functions
    address public owner;
    address public wallet;

    // FEE token reference
    address public feeTokenId;

    // Wei owned by the contract
    uint256 public weiAsFee;
    bool public feeCalculated = false;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier started{
        require(block.number >= startBlock);
        _;
    }

    modifier notExpired{
        require(block.number < expiryBlock);
        _;
    }

    modifier hasExpired{
        require(block.number >= expiryBlock);
        _;
    }

    modifier addressNotEmpty(address a) {
      require(a != address(0));
      _;
    }

    modifier uintNotEmpty(uint256 number) {
      require(number != 0);
      _;
    }

    function () public payable {
        weiAsFee = weiAsFee.add(msg.value);
    }

    /// @notice Constructor to set all the default values for the owner, wallet,
    /// weiPerFee, tokenID and expiryBlock
    function Stake(
      address _owner,
      address _wallet,
      uint256 _weiPerFee,
      address _tokenid
    ) public
      addressNotEmpty(_wallet)
      addressNotEmpty(_owner)
      addressNotEmpty(_tokenid)
      uintNotEmpty(_weiPerFee)
    {
      tokenid = _tokenid;
      owner = _owner;
      wallet = _wallet;
      weiPerFee = _weiPerFee;
    }

    /// @notice To set the the address of the LEV token
    /// @param _tokenid The token address
    function setToken(address _tokenid) external addressNotEmpty(_tokenid) onlyOwner {
      tokenid = _tokenid;
    }

    /// @notice To set the FEE token address
    /// @param _feeTokenId The address of that token
    function setFeeToken(address _feeTokenId) external addressNotEmpty(_feeTokenId) onlyOwner {
      feeTokenId = _feeTokenId;
    }

    /// @notice To set the wallet address by the owner only
    /// @param _wallet The wallet address
    function setWallet(address _wallet)
      external
      addressNotEmpty(_wallet)
      onlyOwner
      returns(bool)
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
      uintNotEmpty(_quantity)
      started
      notExpired
      returns (bool result)
    {
      require(Token(tokenid).balanceOf(msg.sender) >= _quantity);

      levBlocks[msg.sender] = SafeMath.add(levBlocks[msg.sender], SafeMath.mul(_quantity, SafeMath.sub(expiryBlock, block.number)));
      stakes[msg.sender] = SafeMath.add(stakes[msg.sender], _quantity);
      totalLevBlocks = SafeMath.add(totalLevBlocks, SafeMath.mul(_quantity, SafeMath.sub(expiryBlock, block.number)));
      totalLevs = SafeMath.add(totalLevs,_quantity);
      Token(tokenid).transferFrom(msg.sender, this, _quantity);
      StakeEvent(msg.sender, _quantity, 'STAKED', startBlock, expiryBlock);
      return true;
    }

    /// @notice To update the price of FEE tokens to the current value. Executable
    /// by the owner only
    function updateFeeForCurrentPeriod() public onlyOwner hasExpired returns (bool result){
        require(feeCalculated == false);

        uint256 feeFromExchange = Fee(feeTokenId).balanceOf(this);
        feeForThePeriod = SafeMath.add(feeFromExchange, SafeMath.div(this.balance , weiPerFee));
        feeCalculated = true;
        Fee(feeTokenId).burnTokens(feeFromExchange);
        wallet.transfer(this.balance);
        weiAsFee = 0;
        return true;
    }

    /// @notice To unlock and recover your LEV and FEE tokens after staking
    /// and fee to any user
    function redeemLevAndFee() public returns (bool) {
      return redeemLevAndFeeInternal(msg.sender);
    }

    function sendLevAndFeeToUsers(address[] _users)
      public
      onlyOwner
      returns (bool)
    {
      for(uint i = 0 ; i < _users.length; i++){
        redeemLevAndFeeInternal(_users[i]);
      }
      return true;
    }

    function redeemLevAndFeeInternal(address _user)
      internal
      addressNotEmpty(_user)
      hasExpired
      returns (bool)
    {
      require(feeCalculated);
      require(totalLevBlocks > 0);
      uint256 levBlock = levBlocks[_user];
      uint256 stake = stakes[_user];
      require(stake > 0);
      uint256 feeEarned = SafeMath.div(SafeMath.mul(levBlock, feeForThePeriod) , totalLevBlocks);
      delete stakes[_user];
      delete levBlocks[_user];
      totalLevs = SafeMath.sub(totalLevs, stake);
      if (feeEarned > 0) require(Fee(feeTokenId).sendTokens(_user, feeEarned));
      require(Token(tokenid).transfer(_user, stake));
      StakeEvent(_user, stake, 'CLAIMED', startBlock, expiryBlock);
      return true;
    }

    /// @notice To start a new trading period where the price of the FEE will be updated
    /// @param _start The starting block.number of the new period
    /// @param _expiry When the new period ends in block.number
    function startNewTradingPeriod(uint256 _start, uint256 _expiry)
      external
      uintNotEmpty(_start)
      uintNotEmpty(_expiry)
      onlyOwner
      hasExpired
      returns (bool result)
    {
        require(totalLevs == 0);
        startBlock = _start;
        expiryBlock = _expiry;
        totalLevBlocks = 0;
        feeForThePeriod = 0;
        weiAsFee = 0;
        feeCalculated = false;
        return true;
    }

    /// @notice To get how many LEV blocks has an address
    /// @param _for The owner of the blocks
    function getLevBlocks(address _for) public constant returns (uint256 levBlock){
        return levBlocks[_for];
    }

    /// @notice To get how many LEV blocks has an address
    /// @param _for The owner of the blocks
    function getStakes(address _for) public constant returns (uint256 stake){
        return stakes[_for];
    }
}
