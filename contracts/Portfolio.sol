/**
 *@title Portfolio.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice This is an EditablePaymentSplitter that stores the root factory and edits the UI state.
 */
pragma solidity ^0.5.0;

import "./EditablePaymentSplitter.sol";
import "./Nameable.sol";

contract Portfolio is EditablePaymentSplitter, Nameable{

    /**
     *  Storage
     */
    address public factoryAddress;

    /**
     *  Events
     */
    event CharityLookupAdded(address factory);
    event CharityLookupNotAdded(address factory);

    /**
     *  Public Functions
     */
    ///@dev Takes the factory address and updates root factory UI mappings
    //@param _factoryAddress root factory address
    constructor (address[] memory payees, uint256[] memory shares, address _factoryAddress, string memory name)
        EditablePaymentSplitter(payees, shares)
        Nameable(name)
        public
        payable
    {
        factoryAddress = _factoryAddress;
        updateFactoryCharities(payees);
    }

    ///@dev makes naming only available to owner
    function reName(string memory _name) public onlyOwner{
        name = _name;
        emit Renamed(name);
    }

    /**
     *  Internal Functions
     */
    ///@dev Updates the UI lookup mapping using an external function call
    ///@param payees is the added payees
    function updateFactoryCharities(address[] memory payees)
        internal
    {
        (bool success, bytes memory returnData) = factoryAddress.call(abi.encodeWithSignature("registerCharities(address[],address)",payees,address(this)));
        if (success){
            emit CharityLookupAdded(factoryAddress);
        }
        else {
            emit CharityLookupNotAdded(factoryAddress);
        }
    }

    ///@dev This overrides reconstructor in EditablePaymentSplitter to update UI root address
    function reconstructor(address[] calldata payees, uint256[] calldata shares) external onlyOwner {
        require(payees.length == shares.length, "Payees, shares length mismatch");
        require(payees.length > 0, "No payees");

        escrowPayees();

        for (uint256 i = 0; i < payees.length; i++) {
            _addPayee(payees[i], shares[i]);
        }
        updateFactoryCharities(payees);
        emit LogReconstruction(payees);
    }
}