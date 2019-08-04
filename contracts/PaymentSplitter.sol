/**
 * @title PaymentSplitter
 * @author OpenZeppelin
 * July 28 2019: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/payment/PaymentSplitter.sol
 * @notice This contract has been slightly adapted from the original. Changes include replacing 'private' with
 * 'internal' for inheritance purposes, local SafeMath import, and style re-formatting.
 * This contract allows to split Ether payments among a group of accounts. The sender does not need to be aware
 * that the Ether will be split in this way, since it is handled transparently by the contract.
 *
 * The split can be in equal parts or in any other arbitrary proportion. The way this is specified is by assigning each
 * account to a number of shares. Of all the Ether that this contract receives, each account will then be able to claim
 * an amount proportional to the percentage of total shares they were assigned.
 *
 * `PaymentSplitter` follows a _pull payment_ model. This means that payments are not automatically forwarded to the
 * accounts but kept in this contract, and the actual transfer is triggered as a separate step by calling the `release`
 * function.
 */

pragma solidity ^0.5.0;

import "./SafeMath.sol";

contract PaymentSplitter {

    /*
     *  Declarations
     */
    using SafeMath for uint256;

    /*
     *  Storage
     */
    uint256 internal _totalShares;
    uint256 internal _totalReleased;
    mapping(address => uint256) internal _shares;
    mapping(address => uint256) internal _released;
    address[] internal _payees;

    /*
     *  Events
     */
    event PayeeAdded(address account, uint256 shares);
    event PaymentReleased(address to, uint256 amount);
    event PaymentReceived(address from, uint256 amount);

    /*
     *  Fallback Function
     */
     ///@dev The Ether received will be logged with `PaymentReceived` events. Note that these events are not fully
     ///reliable: it's possible for a contract to receive Ether without triggering this function. This only affects the
     ///reliability of the events, and not the actual splitting of Ether.
    function () external payable {
        emit PaymentReceived(msg.sender, msg.value);
    }

    /*
     *  Public Functions
     */
    ///@dev Creates an instance of `PaymentSplitter` where each account in `payees` is assigned the number of shares at
    ///the matching position in the `shares` array. All addresses in `payees` must be non-zero. Both arrays must have
    ///the same non-zero length, and there must be no duplicates in `payees`.
    ///@param payees is the array of address that will be split among
    ///@param shares is the array of uint that will split the balance
    constructor (address[] memory payees, uint256[] memory shares) public payable {
        require(payees.length == shares.length, "PaymentSplitter: payees and shares length mismatch");
        require(payees.length > 0, "PaymentSplitter: no payees");

        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares[i]);
        }
    }

    ///@dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the
    ///total shares and their previous withdrawals.
    ///@param account is the address of a payee
    function release(address payable account) external {
        require(_shares[account] > 0, "PaymentSplitter: account has no shares");

        uint256 totalReceived = address(this).balance.add(_totalReleased);
        uint256 payment = totalReceived.mul(_shares[account]).div(_totalShares).sub(_released[account]);

        require(payment != 0, "PaymentSplitter: account is not due payment");
        _released[account] = _released[account].add(payment);
        _totalReleased = _totalReleased.add(payment);
        account.transfer(payment);
        emit PaymentReleased(account, payment);
    }

    /*
     *  Internal Functions
     */
    ///@dev Add a new payee to the contract.
    ///@param account The address of the payee to add.
    ///@param shares_ The number of shares owned by the payee.
    function _addPayee(address account, uint256 shares_) internal {
        require(account != address(0), "PaymentSplitter: account is the zero address");
        require(shares_ > 0, "PaymentSplitter: shares are 0");
        require(_shares[account] == 0, "PaymentSplitter: account already has shares");

        _payees.push(account);
        _shares[account] = shares_;
        _totalShares = _totalShares.add(shares_);
        emit PayeeAdded(account, shares_);
    }

    /*
     * Getter functions
     */
    ///@dev Getter for the total shares held by payees.
    ///@return Returns the total number of shares.
    function totalShares() public view returns (uint256) {
        return _totalShares;
    }

    ///@dev Getter for the total amount of Ether already released.
    ///@return Returns the total amount of Ether that has been released.
    function totalReleased() public view returns (uint256) {
        return _totalReleased;
    }

    ///@dev Getter for the amount of shares held by an account.
    ///@param account is the address of a payee.
    ///@return Returns the total number of shares the payee has.
    function shares(address account) public view returns (uint256) {
        return _shares[account];
    }

    ///@dev Getter for the amount of Ether already released to a payee.
    ///@param account is the address of a payee.
    ///@return Returns the total amount of Ether that has been released to a payee.
    function released(address account) public view returns (uint256) {
        return _released[account];
    }

    ///@dev Getter for the address of the payee number `index`.
    ///@param index is the position in the address array.
    ///@return Returns the address from an index in the payee array.
    function payee(uint256 index) public view returns (address) {
        return _payees[index];
    }
}