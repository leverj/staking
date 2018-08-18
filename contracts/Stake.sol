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
    uint public interval;
    uint public deployedBlock;

    // events
    event StakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event ReStakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event RedeemEvent(address indexed user, uint levs, uint feeEarned, uint startBlock, uint endBlock, uint intervalId);
    event FeeCalculated(uint feeCalculated, uint feeReceived, uint weiReceived, uint startBlock, uint endBlock, uint intervalId);
    event Block(uint start, uint end, uint intervalId);
    //account
    struct UserStake {uint interval; uint lev; uint levBlock;}

    mapping(address => UserStake) public stakes;
    // per staking interval data
    mapping(uint => uint) public totalLevBlocks;
    mapping(uint => uint) public FEEGenerated;
    mapping(uint => uint) public start;
    mapping(uint => uint) public end;
    mapping(uint => bool) public FEECalculated;

    // user specific
    uint public latest;

    modifier isAllowed{require(isOwner[msg.sender]);
        _;}

    function() public payable {}

    /// @notice Constructor to set all the default values for the owner, wallet,
    /// weiPerFee, tokenID and endBlock
    constructor(address[] _owners, address _operator, address _wallet, uint _weiPerFee, address _levToken, address _feeToken, uint _interval) public
    validAddress(_wallet) validAddress(_operator) validAddress(_levToken) validAddress(_feeToken) notZero(_weiPerFee) notZero(_interval){
        setOwners(_owners);
        operator = _operator;
        wallet = _wallet;
        weiPerFEE = _weiPerFee;
        LEV = Token(_levToken);
        interval = _interval;
        FEE = IFee(_feeToken);
        deployedBlock = block.number;
        latest = 1;
        start[latest] = deployedBlock;
        end[latest] = start[latest] + interval;
    }

    /// @notice To set the wallet address by the owner only
    /// @param _wallet The wallet address
    function setWallet(address _wallet) external validAddress(_wallet) onlyOwner {
        ensureInterval();
        wallet = _wallet;
    }

    function setInterval(uint _interval) external notZero(_interval) onlyOwner {
        ensureInterval();
        interval = _interval;
    }

    function getCurrentStakingPeriod() external constant returns (uint _start, uint _end){
        uint diff = (block.number - deployedBlock) % interval;
        _start = block.number - diff;
        _end = _start + interval;
    }

    //create interval if not there
    function ensureInterval() public {
        if (end[latest] > block.number) return;
        _calculateFEE2Distribute();
        uint diff = (block.number - end[latest]) % interval;
        latest = latest + 1;
        start[latest] = end[latest - 1];
        end[latest] = block.number - diff + interval;
        emit Block(start[latest], end[latest], latest);
    }

    //calculate fee for previous interval if not calculated
    function _calculateFEE2Distribute() private {
        if (FEECalculated[latest] || end[latest] > block.number) return;
        (uint feeEarned, uint ethEarned) = calculateDistributedIntervalEarning(start[latest], end[latest]);
        FEEGenerated[latest] = feeEarned.add(ethEarned.div(weiPerFEE));
        FEECalculated[latest] = true;
        emit FeeCalculated(FEEGenerated[latest], feeEarned, ethEarned, start[latest], end[latest], latest);
        if (feeEarned > 0) FEE.burnTokens(feeEarned);
        if (ethEarned > 0) wallet.transfer(ethEarned);
    }

    function restake(int _signedQuantity) private {
        UserStake storage userStake = stakes[msg.sender];
        if (userStake.interval == latest || userStake.interval == 0) return;
        uint lev = userStake.lev;
        uint withdrawLev = _signedQuantity >= 0 ? 0 : uint(_signedQuantity * - 1) >= userStake.lev ? userStake.lev : uint(_signedQuantity * - 1);
        _withdraw(withdrawLev);
        userStake.lev = lev.sub(withdrawLev);
        if (userStake.lev == 0) {
            delete stakes[msg.sender];
            return;
        }
        userStake.interval = latest;
        userStake.levBlock = userStake.lev.mul(interval);
        totalLevBlocks[latest] = totalLevBlocks[latest].add(userStake.levBlock);
        emit ReStakeEvent(msg.sender, userStake.lev, start[latest], end[latest], latest);
    }

    function stake(int _signedQuantity) external {
        ensureInterval();
        restake(_signedQuantity);
        if (_signedQuantity <= 0) return;
        stakeWithCurrentPeriod(uint(_signedQuantity));
    }

    function stakeWithCurrentPeriod(uint _quantity) private {
        require(LEV.allowance(msg.sender, this) >= _quantity, "Approve LEV tokens first");
        UserStake storage userStake = stakes[msg.sender];
        userStake.interval = latest;
        userStake.levBlock = userStake.levBlock.add(_quantity.mul(end[latest].sub(block.number)));
        userStake.lev = userStake.lev.add(_quantity);
        totalLevBlocks[latest] = totalLevBlocks[latest].add(_quantity.mul(end[latest].sub(block.number)));
        require(LEV.transferFrom(msg.sender, this, _quantity), "LEV token transfer was not successful");
        emit StakeEvent(msg.sender, _quantity, start[latest], end[latest], latest);
    }

    function withdraw() external {
        ensureInterval();
        UserStake storage userStake = stakes[msg.sender];
        if (userStake.interval == 0 || userStake.interval == latest) return;
        _withdraw(userStake.lev);
    }

    function _withdraw(uint lev) private {
        UserStake storage userStake = stakes[msg.sender];
        uint _interval = userStake.interval;
        uint feeEarned = userStake.levBlock.mul(FEEGenerated[_interval]).div(totalLevBlocks[_interval]);
        delete stakes[msg.sender];
        if (feeEarned > 0) FEE.sendTokens(msg.sender, feeEarned);
        if (lev > 0) require(LEV.transfer(msg.sender, lev));
        emit RedeemEvent(msg.sender, lev, feeEarned, start[_interval], end[_interval], _interval);
    }

    function calculateDistributedIntervalEarning(uint _start, uint _end) public constant returns (uint _feeEarned, uint _ethEarned){
        _feeEarned = FEE.balanceOf(this);
        _ethEarned = address(this).balance;
        _feeEarned = _feeEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
        _ethEarned = _ethEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
    }
}
