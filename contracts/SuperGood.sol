/**
 *@title SuperGood.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice This is a factory that makes 'GoodBoards' and Subscribes Board member.
 */

pragma solidity ^0.5.0;

import "./GoodBoard.sol";
import "./Ownable.sol";
import "./Factory.sol";

contract SuperGood is Factory, Ownable{

    /*
     *  Storage
     */
    uint public SubscriptionCost; //Free Initially
    address[] public GoodBoards;
    mapping(address => address[]) public SubscribeLookup;
    mapping(address => mapping(address => bool)) isDupeSubscribe;
    mapping(address => address[]) public CharityLookup;
    mapping(address => mapping(address => bool)) isDupeCharity;
    mapping(address => bool) public isCharityInstantiation;

    /*
     *  Events
     */
    event BoardSubscribeAdded(address newGoodBoard);
    event SubscribeAdded(address subscriber, address subscribedTo);
    event CharitySubscribeAdded(address portfolioAddress);


    /*
     * Public functions
     */
    constructor() public
    {}

    ///@dev Builds a payment splitter portfolio that can be reconstructed
    ///@param _owners would be an array of board member addresses.
    function build(address[] calldata _owners, string calldata name) external {
        address newGoodBoard = address(new GoodBoard(_owners, address(this), name));
        GoodBoards.push(newGoodBoard);
        register(newGoodBoard);
        registerBoard(_owners, newGoodBoard);
    }

    ///@dev Registers subscribers for UI.
    ///@param watchAddress would be an array of board member addresses.
    function paidSubscribe(address watchAddress)
        public
        payable

    {
        require(msg.value >= SubscriptionCost, "Message value incorrect");
        SubscribeLookup[msg.sender].push(watchAddress);
        emit SubscribeAdded(msg.sender, watchAddress);
    }


    ///@dev Changes the current subscription cost.
    ///@param newCostUn value in wei un subscription cost.
    ///@param newCostSub value in wei subscription cost.
    function changeSubcriptionCost(uint newCostUn, uint newCostSub)
        public
        onlyOwner
    {
        SubscriptionCost = newCostSub;
        
    }

    ///@dev Withdraws funds.
    function withdraw() public onlyOwner{
        owner().transfer(address(this).balance);
    }

    /*
     * Internal functions
     */
    ///@dev Registers Board members for UI.
    ///@param _owners would be an array of board member addresses.
    ///@param GoodBoardAddress would be the board address.
    function registerBoard(address[] memory _owners, address GoodBoardAddress)
        internal
    {
        for(uint i = 0; i < _owners.length; i++){
            this.internalSubscribe(_owners[i], GoodBoardAddress);
        }
        emit BoardSubscribeAdded(GoodBoardAddress);
    }

    ///@dev Registers charities for UI.
    ///@param charityAddress would be the charity address.
    ///@param watchAddress would be the GoodPortfolio addresses.
    function charitySubscribe(address charityAddress, address watchAddress)
        internal
    {
        //require(isCharityInstantiation[msg.sender] || isInstantiation[msg.sender], "Calling address not board instantiation");
        if(!isDupeCharity[charityAddress][watchAddress]){
            CharityLookup[charityAddress].push(watchAddress);
            isDupeCharity[charityAddress][watchAddress] = true;
        }
        emit SubscribeAdded(charityAddress, watchAddress);
    }

    /*
     * External functions
     */
    ///@dev Registers Charities for UI.
    ///@param _charities would be an array of charity addresses.
    ///@param portfolioAddress would be the portfolio address.
    function registerCharities(address[] calldata _charities, address portfolioAddress)
        external
    {
        for(uint i = 0; i < _charities.length; i++){
            isCharityInstantiation[_charities[i]] = true;
            charitySubscribe(_charities[i], portfolioAddress);
        }
        emit CharitySubscribeAdded(portfolioAddress);
    }

    ///@dev Registers subscribers for UI.
    ///@param subscriber would be the board member address.
    ///@param watchAddress would be the GoodBoard addresses.
    function internalSubscribe(address subscriber, address watchAddress)
        external
    {
        require(isInstantiation[msg.sender] || msg.sender == address(this), "Not instantiation");
        if(!isDupeSubscribe[subscriber][watchAddress]){
            SubscribeLookup[subscriber].push(watchAddress);
            isDupeSubscribe[subscriber][watchAddress] = true;
        }
        emit SubscribeAdded(subscriber, watchAddress);
    }

    /*
     * Getter functions
     */
     ///@dev returns amount of subscriptions given a subscriber address
     ///@param subscriber address of subscriber
     ///@return number of subscriptions + interested portfolios
     function getSubscribeLength(address subscriber)
        public
        view
        returns(uint length)
    {
        return(SubscribeLookup[subscriber].length);
    }

    ///@dev returns amount of subscriptions given a charity address
    ///@param charity address of charity.
    ///@return number of portfolios a charity is in
    function getCharitySubscribeLength(address charity)
        public
        view
        returns(uint length)
    {
        return(CharityLookup[charity].length);
    }

    ///@dev returns array of GoodBoards instantiated
    ///@return array of GoodBoards
    function getGoodBoards()
        public
        view
        returns(address[] memory)
    {
        return GoodBoards;
    }

}
