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

import "tokens/HumanStandardToken.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Fee.sol";

contract Stake {
    event StakeEvent(address indexed _user, uint256 _levs, string action);

    // user address to (lev tokens)*(blocks left to expiry)
    mapping (address => uint256) levBlocks;

    // User address to lev tokens at stake
    mapping (address => uint256) stakes;

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

    HumanStandardToken public token;

    uint public startBlock;

    uint public expiryBlock;

    /*owner address for admin functions*/
    address public owner;

    address public wallet;

    /* fee token reference*/
    address public feeTokenId;

    Fee public fee;

    /* wei owned by contarct */
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

    function () payable {
      weiAsFee = weiAsFee.add(msg.value);
    }

    /// @notice Constructor to set all the default values for the owner, wallet,
    /// weiPerFee, tokenID and expiryBlock
    function Stake(address _owner, address _wallet, uint256 _weiPerFee, address _tokenid, uint _expiryBlock){
      require(_owner != address(0));
      require(_wallet != address(0));
      require(_weiPerFee > 0);
      require(_tokenid != address(0));
      require(_expiryBlock > 0);

      tokenid = _tokenid;
      expiryBlock = _expiryBlock;
      owner = _owner;
      wallet = _wallet;
      token = HumanStandardToken(_tokenid);
      weiPerFee = _weiPerFee;
    }

    /// @notice To set the the address of the LEV token
    /// @param _tokenid The token address
    function setToken(address _tokenid) onlyOwner {
      require(_tokenid != address(0));

      tokenid = _tokenid;
      token = HumanStandardToken(_tokenid);
    }

    /// @notice To set the FEE token address
    /// @param _feeTokenId The address of that token
    function setFeeToken(address _feeTokenId) onlyOwner {
      require(_feeTokenId != address(0));

      feeTokenId = _feeTokenId;
      fee = Fee(_feeTokenId);
    }

    /// @notice To set the wallet address by the owner only
    /// @param _wallet The wallet address
    function setWallet(address _wallet) onlyOwner returns (bool result) {
      require(_wallet != address(0));

      wallet = _wallet;
      return true;
    }

    /// @notice To set the start and end blocks by the owner only
    /// @param _start The start block.number
    /// @param _expiry The end block.number
    function setBlocks(uint _start, uint _expiry) onlyOwner {
      require(_start > 0);
      require(_expiry > 0);
      require(_expiry > _start);

      startBlock = _start;
      expiryBlock = _expiry;
    }


    /// @notice Public function to stake tokens executable by any user. The user
    /// has to approve the staking contract on token before calling this function.
    /// Refer to the tests for more information
    /// @param _quantity How many LEV tokens to lock for staking
    function stakeTokens(uint256 _quantity) external started notExpired returns (bool result) {
      require(_quantity > 0);
      require(token.balanceOf(msg.sender) >= _quantity);

      levBlocks[msg.sender] = levBlocks[msg.sender].add(_quantity.mul(expiryBlock.sub(block.number)));
      stakes[msg.sender] = stakes[msg.sender].add(_quantity);
      totalLevBlocks = totalLevBlocks.add(_quantity.mul(expiryBlock.sub(block.number)));
      totalLevs = totalLevs.add(_quantity);
      token.transferFrom(msg.sender, this, _quantity);
      StakeEvent(msg.sender, _quantity, "STAKED");
      return true;
    }

    /// @notice To update the price of FEE tokens to the current value. Executable
    /// by the owner only
    function updateFeeForCurrentPeriod() external onlyOwner hasExpired returns (bool result) {
        require(feeCalculated == false);

        uint256 feeFromExchange = fee.balanceOf(this);
        feeForThePeriod = feeFromExchange + weiAsFee / weiPerFee;
        feeCalculated = true;
        fee.burnTokens(feeFromExchange);
        wallet.transfer(weiAsFee);
        weiAsFee = 0;
        return true;
    }

    /// @notice To unlock and recover your LEV and FEE tokens after staking
    /// @param _user The user address or msg.sender if you're an owner
    /// TODO: Understand how is this supposed to work for the owner?
    function redeemLevAndFee(address _user) external hasExpired returns (bool result) {
        require(msg.sender == _user || msg.sender == owner);
        require(feeCalculated);

        address receiver
        msg.sender == owner ? receiver = owner : receiver = _user;
        uint256 levBlock = levBlocks[receiver];
        uint256 stake = stakes[receiver];

        require(stake > 0);

        uint256 feeEarned = levBlock.mul(feeForThePeriod.div(totalLevBlocks));
        delete stakes[receiver];
        delete levBlocks[receiver];
        if (feeEarned > 0) fee.sendTokens(receiver, feeEarned);
        token.transfer(receiver, stake);
        StakeEvent(receiver, stake, "CLAIMED");
        totalLevs = totalLevs.sub(stake);
        return true;
    }

    /// @notice To start a new trading period where the price of the FEE will be updated
    /// @param _start The starting block.number of the new period
    /// @param _expiry When the new period ends in block.number
    function startNewTradingPeriod(uint _start, uint _expiry) external onlyOwner returns (bool result) {
      require(_start > 0);
      require(_expiry > 0);
      require(_expiry > _start);
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
    function getLevBlocks(address _for) external constant returns (uint256 levBlock) {
      return levBlocks[_for];
    }

    /// @notice To get and see how many stakes a user has
    /// @param _for The address of the user
    function getStakes(address _for) external constant returns (uint256 stake) {
      return stakes[_for];
    }
}
