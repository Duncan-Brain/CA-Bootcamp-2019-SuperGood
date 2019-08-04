/**
 *@title Portfolio.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice Contract module which allows a contract to be named and edited. This module is used through inheritance.
 *It will make available the 'reName' function.
 */
pragma solidity ^0.5.0;

contract Nameable {

    /**
     *  Storage
     */
    ///@dev Emitted when the name is renamed.
    string public name;
    event Renamed(string name);

    /**
     *  Public Functions
     */
     ///@dev Initializes the name
     ///@param _name the name of what is being named
    constructor (string memory _name) internal {
        name = _name;
    }

    ///@dev Called by a owner to name.
    function reName(string memory _name) public {
        name = _name;
        emit Renamed(name);
    }
}