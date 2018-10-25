pragma solidity ^0.4.24;


import './SafeMath.sol';
import './Owned.sol';
import './Validating.sol';
import './Token.sol';
import './IFee.sol';
import './GenericCall.sol';


contract Stake is Owned, Validating, GenericCall {
    using SafeMath for uint;
    string public version;
    uint public weiPerFEE; // Wei for each Fee token
    Token public LEV;
    IFee public FEE;
    address public wallet;
    address registry;
    uint public intervalSize;
    bool public halted;
    uint public FEE2Distribute;
    uint public totalLevStaked;

    // events
    event StakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event ReStakeEvent(address indexed user, uint levs, uint startBlock, uint endBlock, uint intervalId);
    event RedeemEvent(address indexed user, uint levs, uint feeEarned, uint startBlock, uint endBlock, uint intervalId);
    event FeeCalculated(uint feeCalculated, uint feeReceived, uint weiReceived, uint startBlock, uint endBlock, uint intervalId);
    event StakingInterval(uint start, uint end, uint intervalId);
    event Halt(uint block, uint intervalId);
    //account
    struct Stake {uint intervalId; uint quantity; uint worth;}

    mapping(address => Stake) public stakes;
    // per staking interval data
    struct Interval {uint worth; uint generatedFEE; uint start; uint end;}

    mapping(uint => Interval) public intervals;

    // user specific
    uint public latest;

    modifier isAllowed(address destination){
        require(isOwner[msg.sender]);
        require(destination != address(FEE) && destination != address(LEV), "Generic functions can not work on lev or fee contract");
        _;
    }

    modifier notHalted{require(!halted, "exchange is halted");
        _;}

    function() public payable {}

    /// @notice Constructor to set all the default values for the owner, wallet,
    /// weiPerFee, tokenID and endBlock
    constructor(address[] _owners, address _wallet, uint _weiPerFee, address _levToken, address _feeToken, uint _intervalSize, string _version) public
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
        version = _version;
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
    function ensureInterval() public notHalted {
        if (intervals[latest].end > block.number) return;

        Interval storage interval = intervals[latest];
        (uint feeEarned, uint ethEarned) = calculateIntervalEarning(interval.start, interval.end);
        interval.generatedFEE = feeEarned.add(ethEarned.div(weiPerFEE));
        FEE2Distribute = FEE2Distribute.add(interval.generatedFEE);
        if (ethEarned.div(weiPerFEE) > 0) FEE.sendTokens(this, ethEarned.div(weiPerFEE));
        emit FeeCalculated(interval.generatedFEE, feeEarned, ethEarned, interval.start, interval.end, latest);
        if (ethEarned > 0) wallet.transfer(ethEarned);

        uint diff = (block.number - intervals[latest].end) % intervalSize;
        latest = latest + 1;
        intervals[latest].start = intervals[latest - 1].end;
        intervals[latest].end = block.number - diff + intervalSize;
        emit StakingInterval(intervals[latest].start, intervals[latest].end, latest);
    }

    function restake(int _signedQuantity) private {
        Stake storage stake = stakes[msg.sender];
        if (stake.intervalId == latest || stake.intervalId == 0) return;
        uint lev = stake.quantity;
        uint withdrawLev = _signedQuantity >= 0 ? 0 : uint(_signedQuantity * - 1) >= stake.quantity ? stake.quantity : uint(_signedQuantity * - 1);
        redeem(withdrawLev);
        stake.quantity = lev.sub(withdrawLev);
        if (stake.quantity == 0) {
            delete stakes[msg.sender];
            return;
        }
        Interval storage interval = intervals[latest];
        stake.intervalId = latest;
        stake.worth = stake.quantity.mul(interval.end.sub(interval.start));
        interval.worth = interval.worth.add(stake.worth);
        emit ReStakeEvent(msg.sender, stake.quantity, interval.start, interval.end, latest);
    }

    function stake(int _signedQuantity) external notHalted {
        ensureInterval();
        restake(_signedQuantity);
        if (_signedQuantity <= 0) return;
        stakeInCurrentPeriod(uint(_signedQuantity));
    }

    function stakeInCurrentPeriod(uint _quantity) private {
        require(LEV.allowance(msg.sender, this) >= _quantity, "Approve LEV tokens first");
        Interval storage interval = intervals[latest];
        stakes[msg.sender].intervalId = latest;
        stakes[msg.sender].worth = stakes[msg.sender].worth.add(_quantity.mul(intervals[latest].end.sub(block.number)));
        stakes[msg.sender].quantity = stakes[msg.sender].quantity.add(_quantity);
        interval.worth = interval.worth.add(_quantity.mul(interval.end.sub(block.number)));
        require(LEV.transferFrom(msg.sender, this, _quantity), "LEV token transfer was not successful");
        totalLevStaked = totalLevStaked.add(_quantity);
        emit StakeEvent(msg.sender, _quantity, interval.start, interval.end, latest);
    }

    function withdraw() external {
        if (!halted) ensureInterval();
        if (stakes[msg.sender].intervalId == 0 || stakes[msg.sender].intervalId == latest) return;
        redeem(stakes[msg.sender].quantity);
    }

    function halt() notHalted external onlyOwner {
        intervals[latest].end = block.number;
        ensureInterval();
        halted = true;
        emit Halt(block.number, latest - 1);
    }

    function transferToWalletAfterHalt() public onlyOwner {
        require(halted, "Stake is not halted yet.");
        uint feeEarned = FEE.balanceOf(this).sub(FEE2Distribute);
        uint ethEarned = address(this).balance;
        if (feeEarned > 0) FEE.transfer(wallet, feeEarned);
        if (ethEarned > 0) wallet.transfer(ethEarned);
    }

    function transferToken(address token) public {
        if (token == address(FEE)) return;
        uint balance = Token(token).balanceOf(this);
        if(token == address(LEV)) balance = balance.sub(totalLevStaked);
        if(balance > 0)  Token(token).transfer(wallet, balance);
    }

    function redeem(uint lev) private {
        uint intervalId = stakes[msg.sender].intervalId;
        Interval storage interval = intervals[intervalId];
        uint feeEarned = stakes[msg.sender].worth.mul(interval.generatedFEE).div(interval.worth);
        delete stakes[msg.sender];
        if (feeEarned > 0) {
            FEE2Distribute = FEE2Distribute.sub(feeEarned);
            FEE.transfer(msg.sender, feeEarned);
        }
        if (lev > 0) {
            totalLevStaked = totalLevStaked.sub(lev);
            require(LEV.transfer(msg.sender, lev));
        }
        emit RedeemEvent(msg.sender, lev, feeEarned, interval.start, interval.end, intervalId);
    }

    function calculateIntervalEarning(uint _start, uint _end) public constant returns (uint _feeEarned, uint _ethEarned){
        _feeEarned = FEE.balanceOf(this).sub(FEE2Distribute);
        _ethEarned = address(this).balance;
        _feeEarned = _feeEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
        _ethEarned = _ethEarned.mul(_end.sub(_start)).div(block.number.sub(_start));
    }
}
