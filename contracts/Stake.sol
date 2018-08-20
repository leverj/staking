pragma solidity ^0.4.19;


import './SafeMath.sol';
import './Owned.sol';
import './Validating.sol';
import './Token.sol';
import './IFee.sol';
import './GenericCall.sol';


contract Stake is Owned, Validating, GenericCall {
    using SafeMath for uint;

    uint public weiPerFEE; // Wei for each Fee token
    Token public LEV;
    IFee public FEE;
    address public wallet;
    uint public intervalSize;

    // events
    event StakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event ReStakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event RedeemEvent(address indexed user, uint levs, uint feeEarned, uint startBlock, uint endBlock, uint intervalId);
    event FeeCalculated(uint feeCalculated, uint feeReceived, uint weiReceived, uint startBlock, uint endBlock, uint intervalId);
    event Block(uint start, uint end, uint intervalId);
    //account
    struct UserStake {uint intervalId; uint lev; uint levBlock;}

    mapping(address => UserStake) public stakes;
    // per staking interval data
    struct Interval {uint totalLevBlocks;uint FEEGenerated;uint start;uint end;bool FEECalculated;}

    mapping(uint => Interval) public intervals;

    // user specific
    uint public latest;

    modifier isAllowed{require(isOwner[msg.sender]);
        _;}

    function() public payable {}

    /// @notice Constructor to set all the default values for the owner, wallet,
    /// weiPerFee, tokenID and endBlock
    constructor(address[] _owners, address _wallet, uint _weiPerFee, address _levToken, address _feeToken, uint _intervalSize) public
    validAddress(_wallet) validAddress(_levToken) validAddress(_feeToken) notZero(_weiPerFee) notZero(_intervalSize){
        setOwners(_owners);
        wallet = _wallet;
        weiPerFEE = _weiPerFee;
        LEV = Token(_levToken);
        intervalSize = _intervalSize;
        FEE = IFee(_feeToken);
        latest = 1;
        intervals[latest].start = block.number;
        intervals[latest].end = intervals[latest].start + intervalSize;
    }

    /// @notice To set the wallet address by the owner only
    /// @param _wallet The wallet address
    function setWallet(address _wallet) external validAddress(_wallet) onlyOwner {
        ensureInterval();
        wallet = _wallet;
    }

    function setIntervalSize(uint _intervalSize) external notZero(_intervalSize) onlyOwner {
        ensureInterval();
        intervalSize = _intervalSize;
    }

    //create interval if not there
    function ensureInterval() public {
        if (intervals[latest].end > block.number) return;
        _calculateFEE2Distribute();
        uint diff = (block.number - intervals[latest].end) % intervalSize;
        latest = latest + 1;
        intervals[latest].start = intervals[latest - 1].end;
        intervals[latest].end = block.number - diff + intervalSize;
        emit Block(intervals[latest].start, intervals[latest].end, latest);
    }

    //calculate fee for previous interval if not calculated
    function _calculateFEE2Distribute() private {
        Interval storage interval = intervals[latest];
        if (interval.FEECalculated || interval.end > block.number) return;
        (uint feeEarned, uint ethEarned) = calculateDistributedIntervalEarning(interval.start, interval.end);
        interval.FEEGenerated = feeEarned.add(ethEarned.div(weiPerFEE));
        interval.FEECalculated = true;
        emit FeeCalculated(interval.FEEGenerated, feeEarned, ethEarned, interval.start, interval.end, latest);
        if (feeEarned > 0) FEE.burnTokens(feeEarned);
        if (ethEarned > 0) wallet.transfer(ethEarned);
    }

    function restake(int _signedQuantity) private {
        UserStake storage userStake = stakes[msg.sender];
        if (userStake.intervalId == latest || userStake.intervalId == 0) return;
        uint lev = userStake.lev;
        uint withdrawLev = _signedQuantity >= 0 ? 0 : uint(_signedQuantity * - 1) >= userStake.lev ? userStake.lev : uint(_signedQuantity * - 1);
        _withdraw(withdrawLev);
        userStake.lev = lev.sub(withdrawLev);
        if (userStake.lev == 0) {
            delete stakes[msg.sender];
            return;
        }
        Interval storage interval = intervals[latest];
        userStake.intervalId = latest;
        userStake.levBlock = userStake.lev.mul(interval.end.sub(interval.start));
        interval.totalLevBlocks = interval.totalLevBlocks.add(userStake.levBlock);
        emit ReStakeEvent(msg.sender, userStake.lev, interval.start, interval.end, latest);
    }

    function stake(int _signedQuantity) external {
        ensureInterval();
        restake(_signedQuantity);
        if (_signedQuantity <= 0) return;
        stakeWithCurrentPeriod(uint(_signedQuantity));
    }

    function stakeWithCurrentPeriod(uint _quantity) private {
        require(LEV.allowance(msg.sender, this) >= _quantity, "Approve LEV tokens first");
        Interval storage interval = intervals[latest];
        stakes[msg.sender].intervalId = latest;
        stakes[msg.sender].levBlock = stakes[msg.sender].levBlock.add(_quantity.mul(intervals[latest].end.sub(block.number)));
        stakes[msg.sender].lev = stakes[msg.sender].lev.add(_quantity);
        interval.totalLevBlocks = interval.totalLevBlocks.add(_quantity.mul(interval.end.sub(block.number)));
        require(LEV.transferFrom(msg.sender, this, _quantity), "LEV token transfer was not successful");
        emit StakeEvent(msg.sender, _quantity, interval.start, interval.end, latest);
    }

    function withdraw() external {
        ensureInterval();
        if (stakes[msg.sender].intervalId == 0 || stakes[msg.sender].intervalId == latest) return;
        _withdraw(stakes[msg.sender].lev);
    }

    function _withdraw(uint lev) private {
        uint intervalId = stakes[msg.sender].intervalId;
        Interval storage interval = intervals[intervalId];
        uint feeEarned = stakes[msg.sender].levBlock.mul(interval.FEEGenerated).div(interval.totalLevBlocks);
        delete stakes[msg.sender];
        if (feeEarned > 0) FEE.sendTokens(msg.sender, feeEarned);
        if (lev > 0) require(LEV.transfer(msg.sender, lev));
        emit RedeemEvent(msg.sender, lev, feeEarned, interval.start, interval.end, intervalId);
    }

    function calculateDistributedIntervalEarning(uint _start, uint _end) public constant returns (uint _feeEarned, uint _ethEarned){
        _feeEarned = FEE.balanceOf(this);
        _ethEarned = address(this).balance;
        _feeEarned = _feeEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
        _ethEarned = _ethEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
    }
}
