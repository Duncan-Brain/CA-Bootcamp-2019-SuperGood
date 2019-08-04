/**
 *@title Ownable
 *@author OpenZeppelin
 *July 28 2019: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/ownership/Ownable.sol
 *@notice Contract has been changed from original to allow payable and for style re-formatting.
 * Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */

pragma solidity ^0.5.0;

contract Ownable {

    /*
     *  Storage
     */
    address payable private _owner;

    /*
     *  Events
     */
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /*
     *  Modifiers
     */
    ///@dev Throws if called by any account other than the owner.
    modifier onlyOwner() {
        require(isOwner(), "Ownable: caller is not the owner");
        _;
    }

    /*
     *  Public Functions
     */
     ///@dev Initializes the contract setting the deployer as the initial owner.
    constructor () internal {
        _owner = msg.sender;
        emit OwnershipTransferred(address(0), _owner);
    }

    ///@dev Leaves the contract without owner. It will not be possible to call `onlyOwner` functions anymore.
    ///Can only be called by the current owner. Note: Renouncing ownership will leave the contract without an owner,
    ///thereby removing any functionality that is only available to the owner.
    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(_owner, address(0));
        _owner = address(0);
    }

    ///@dev Transfers ownership of the contract to a new account (`newOwner`). Can only be called by the current owner.
    function transferOwnership(address payable newOwner) public onlyOwner {
        _transferOwnership(newOwner);
    }

    ///@dev Transfers ownership of the contract to a new account (`newOwner`).
    function _transferOwnership(address payable newOwner) internal {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    /*
     *  Getter Functions
     */
    ///@return Returns the address of the current owner.
    function owner() public view returns (address payable) {
        return _owner;
    }

    ///@return Returns true if the caller is the current owner.
    function isOwner() public view returns (bool) {
        return msg.sender == _owner;
    }
}