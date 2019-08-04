/**
 *@title EditablePaymentSplitter.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice This is an adaption OpenZeppelin's Payment Splitter to allow re-construction of the portfolio, and migration
 *of one address to another. The Owners have a lot of control here. Bait and switch could happen.
 */

pragma solidity ^0.5.0;

import "./Ownable.sol";
import "./PaymentSplitter.sol";
import "./Pausable.sol";

contract EditablePaymentSplitter is PaymentSplitter, Ownable, Pausable{

    /**
     *  Storage
     */
    uint256 private _totalEscrow;
    uint256 private _previousTotalReceived;
    mapping(address => uint256) private _escrow;
    mapping(address => uint256) private _withdrawals;

    /**
     *  Events
     */
    event PayeeMigrated(address from, address to);
    event LogEscrow(address[] payees);
    event LogReconstruction(address[] payees);

    /*
     *  Fallback Function
     */
     ///@dev Overrides fallback function to omit event emission, Metamask automatically sets a gas this change
    ///encourages direct sending
    function () external payable whenNotPaused{}

    /**
     *  Public Functions
     */
    constructor (address[] memory payees, uint256[] memory shares)
        PaymentSplitter(payees, shares)
        Ownable()
        public
        payable
    {}

    ///@dev Triggers a transfer to `account` of the amount of Ether that account is owed, according to the percentage
    ///of the total shares, their previous withdrawals and changes to the group resulting in escrow.
    ///@param account is the address of a payee
    function release(address payable account) external {
        require(_shares[account] > 0 || _escrow[account] > 0, "No shares, and no escrow");

        uint256 totalReceived = address(this).balance.add(_totalReleased).sub(_previousTotalReceived);
        uint256 payment = 0;

        if(_shares[account] > 0){
            payment = totalReceived.mul(_shares[account]).div(_totalShares).sub(_withdrawals[account]);
            _withdrawals[account] = _withdrawals[account].add(payment);
        }

        if(_escrow[account] > 0){
            payment = payment.add(_escrow[account]);
            _totalEscrow = _totalEscrow.sub(_escrow[account]);
            _escrow[account] = 0;
        }

        require(payment != 0, "Account is not due payment");
        _released[account] = _released[account].add(payment);
        _totalReleased =_totalReleased.add(payment);
        account.transfer(payment);
        emit PaymentReleased(account, payment);
    }

    /**
     *  External Functions
     */
    ///@dev Transfers data from one payee to another. Used if payee account changes or payee quarantine.
    ///@param account is the address of a payee
    ///@param newAccount is the address the funds available will be migrated to
    function migratePayee(address account, address newAccount) external onlyOwner{
        require(newAccount != address(0), "New account cannot be zero");
        require(_shares[account] > 0 || _escrow[account] > 0, "No shares, and no escrow");

        uint setReleased = _released[account];
        uint setShares = _shares[account];
        uint setEscrow = _escrow[account];
        uint setWithdrawals = _withdrawals[account];

        _released[account] = 0;
        _shares[account] = 0;
        _escrow[account] = 0;
        _withdrawals[account] = 0;
        _payees.push(newAccount);
        _released[newAccount] = _released[newAccount].add(setReleased);
        _shares[newAccount] = _shares[newAccount].add(setShares);
        _escrow[newAccount] = _escrow[newAccount].add(setEscrow);
        _withdrawals[newAccount] = _withdrawals[newAccount].add(setWithdrawals);
        emit PayeeMigrated(account, newAccount);
    }

    ///@dev This begins a new shares scheme by reconstructing the 'Payment Splitter'.
    ///WARNING: potential for high gas costs -- test the limits.
    ///@param payees is the new array of payees
    ///@param shares is the new shares scheme for payees
    function reconstructor(address[] calldata payees, uint256[] calldata shares) external onlyOwner {
        require(payees.length == shares.length, "Payees and shares length mismatch");
        require(payees.length > 0, "No payees");

        escrowPayees();

        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares[i]);
        }

        emit LogReconstruction(payees);
    }

    /**
     *  Internal Functions
     */
     ///@dev In order to change share percentage of accounts we must escrow the remaining balance under current scheme
     ///and begin a new shares scheme by reconstructing the 'Payment Splitter'.
    function escrowPayees() internal{
        uint256 forEscrow = 0;
        uint256 totalReceived = address(this).balance.add(_totalReleased).sub(_previousTotalReceived);

        for (uint256 i = 0; i < _payees.length; i++) {
            uint256 payment = totalReceived.mul(_shares[_payees[i]]).div(_totalShares).sub(_withdrawals[_payees[i]]);
            if(payment > 0){
                _escrow[_payees[i]] = _escrow[_payees[i]].add(payment);
                forEscrow = forEscrow.add(payment);
            }
            _shares[_payees[i]] = 0;
            _withdrawals[_payees[i]] = 0;
        }

        _totalEscrow += forEscrow;
        _previousTotalReceived = address(this).balance.add(_totalReleased);
        emit LogEscrow(_payees);
        _payees.length = 0;
    }

    /*
     * Getter functions
     */
    ///@dev Getter for the total Ether held in Escrow.
    ///@return Returns the total amount not yet released from previous distribution schemes.
    function totalEscrow() public view returns (uint256) {
        return _totalEscrow;
    }

    ///@dev Getter for the total amount of Ether already released.
    ///@return Returns the total amount of Ether received under the previous distribution schemes.
    function previousTotalReceived() public view returns (uint256) {
        return _previousTotalReceived;
    }

    ///@dev Getter for the total amount of Ether put in escrow for a payee.
    ///@param account is the address of a payee
    ///@return Returns the total amount remaining in escrow for a specific payee.
    function escrow(address account) public view returns (uint256) {
        return _escrow[account];
    }

    ///@dev Getter for the total amount of Ether released to payee in most recent share distribution.
    ///@param account is the address of a payee
    ///@return Returns the total number of Ether withdrawn under current share distribution.
    function withdrawals(address account) public view returns (uint256) {
        return _withdrawals[account];
    }

    ///@dev Getter for the address array payee length.
    ///@return Returns an length of array of payees.
    function payeesLength() public view returns (uint) {
        return _payees.length;
    }
}