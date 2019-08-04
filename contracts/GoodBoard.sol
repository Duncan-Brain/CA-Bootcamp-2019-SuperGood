/**
 *@title GoodBoard.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice This is a multiple signature wallet committee that generates and controls payment splitter "portfolios". In this case
 * it is intended to build charity portfolios, but nothing prevents non-charities from using this as well.
 */

pragma solidity ^0.5.0;

import "./CommitteeDAO.sol";
import "./Factory.sol";
import "./Portfolio.sol";

contract GoodBoard is CommitteeDAO, Factory{

    /*
     *  Storage
     */
    address[] public Portfolios;
    address public factoryAddress;

    /*
     *  Events
     */
    event BoardSubscriberAdded(address newBoardMember);
    event BoardSubscriberNotAdded(address newBoardMember);

    /*
     * Public functions
     */
    constructor(address[] memory _owners, address _factoryAddress, string memory name) public
        CommitteeDAO(_owners, name)
    {
        factoryAddress = _factoryAddress;
    }

    ///@dev Builds a payment splitter portfolio that can be reconstructed
    ///@param payees would be an array of charities.
    ///@param shares would be the shares per charity.
    function build(address[] memory payees, uint256[] memory shares, string memory name)
        public
        onlyWallet
    {
            address newPortfolio = address(new Portfolio(payees, shares, factoryAddress, name));
            Portfolios.push(newPortfolio);
            register(newPortfolio);
    }

    ///@dev Overrides CommitteeDAO to update factory address Lookup
    function addOwner(address owner)
        public
        onlyWallet
        ownerDoesNotExist(owner)
        notNull(owner)
    {
        isOwner[owner] = true;
        owners.push(owner);
        changeRequirement((owners.length/2) + 1);
        emit OwnerAddition(owner);
        updateFactorySubscribers(owner);
    }

    ///@dev Updates the UI lookup mapping using an external function call
    ///@param owner is the added owner
    function updateFactorySubscribers(address owner)
        internal
    {
        (bool success, bytes memory returnData) = factoryAddress.call(abi.encodeWithSignature("internalSubscribe(address,address)",owner,address(this)));
        if (success){
            emit BoardSubscriberAdded(owner);
        }
        else {
            emit BoardSubscriberNotAdded(owner);
        }
    }

    ///@dev returns amount of portfolios instantiated
    ///@return amount of portfolios
    function getPortfoliosLength()
        public
        view
        returns(uint)
    {
        return Portfolios.length;
    }
}