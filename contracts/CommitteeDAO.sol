/**
 *@title CommitteeDAO.
 *@author Duncan Brain <duncan@brainenterprise.ca>
 *@version 0.5
 *@notice This is a multiple signature wallet that adapts the transaction object to include a proposal parameter. Motion
 * was chosen as a function of committees. The motion pass requirement is set at 50% + 1.
 */

pragma solidity ^0.5.0;

import "./Nameable.sol";

contract CommitteeDAO is Nameable{

    /*
     *  Constants
     */
    uint constant public MAX_OWNER_COUNT = 50;

    struct Motion {
        address destination;
        uint value;
        bytes data;
        bool executed;
        string proposal;
    }

    /*
     *  Storage
     */
    mapping(uint => Motion) public motions;
    mapping (uint => mapping (address => bool)) internal confirmations;
    mapping (address => bool) public isOwner;
    address[] public owners;
    uint public required;
    uint public transactionCount;


    /*
     *  Events
     */
    event Confirmation(address indexed sender, uint indexed transactionId);
    event Revocation(address indexed sender, uint indexed transactionId);
    event Submission(uint indexed transactionId);
    event Execution(uint indexed transactionId);
    event ExecutionFailure(uint indexed transactionId);
    event Deposit(address indexed sender, uint value);
    event OwnerAddition(address indexed owner);
    event OwnerRemoval(address indexed owner);
    event RequirementChange(uint required);



    /*
     *  Modifiers
     */
     /*
     *  Modifiers
     */
    modifier onlyWallet() {
        require(msg.sender == address(this));
        _;
    }

    modifier ownerDoesNotExist(address owner) {
        require(!isOwner[owner]);
        _;
    }

    modifier ownerExists(address owner) {
        require(isOwner[owner]);
        _;
    }

    ///@dev Overrides the MultiSigWallet struct transactions with motions
    modifier transactionExists(uint transactionId) {
        require(motions[transactionId].destination != address(0));
        _;
    }

    modifier confirmed(uint transactionId, address owner) {
        require(confirmations[transactionId][owner]);
        _;
    }

    modifier notConfirmed(uint transactionId, address owner) {
        require(!confirmations[transactionId][owner]);
        _;
    }

   ///@dev Overrides the MultiSigWallet struct transactions with motions
    modifier notExecuted(uint transactionId) {
        require(!motions[transactionId].executed);
        _;
    }

    modifier notNull(address _address) {
        require(_address != address(0));
        _;
    }

    modifier validRequirement(uint ownerCount, uint _required) {
        require(ownerCount <= MAX_OWNER_COUNT
        && _required <= ownerCount
        && _required != 0
        && ownerCount != 0);
        _;
    }
    /*
     *  Fallback Function
     */
    /// @dev Emits event when deposit is made.
    function() external payable {
        if (msg.value > 0){
            emit Deposit(msg.sender, msg.value);
        }
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _required Number of required confirmations.
    ///@dev Sets MultiSigWallet transaction pass requirement to 50% + 1.
    constructor(address[] memory _owners, string memory name)
        public
        Nameable(name)
        validRequirement(_owners.length, _owners.length/2 + 1)
    {
        for (uint i = 0; i < _owners.length; i++) {
            require(!isOwner[_owners[i]] && _owners[i] != address(0));
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        required = _owners.length/2 + 1;
    }

    ///@dev Called by a owner to name.
    function reName(string memory _name) public onlyWallet{
        name = _name;
        emit Renamed(name);
    }

    /// @dev Overrides MultiSigWallet to keep transaction pass requirement to 50% + 1
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
    }

    /// @dev Overrides MultiSigWallet to keep transaction pass requirement to 50% + 1
    function removeOwner(address owner)
        public
        onlyWallet
        ownerExists(owner)
    {
        isOwner[owner] = false;
        for (uint i = 0; i < owners.length - 1; i++){
            if (owners[i] == owner) {
                owners[i] = owners[owners.length - 1];
                break;
            }
        }
        owners.length -= 1;
        changeRequirement(owners.length/2 + 1);
        emit OwnerRemoval(owner);
    }

    /// @dev Allows to replace an owner with a new owner. Transaction has to be sent by wallet.
    /// @param owner Address of owner to be replaced.
    /// @param newOwner Address of new owner.
    function replaceOwner(address owner, address newOwner)
        public
        onlyWallet
        ownerExists(owner)
        ownerDoesNotExist(newOwner)
    {
        for (uint i = 0; i < owners.length; i++){
            if (owners[i] == owner) {
                owners[i] = newOwner;
                break;
            }
        }
        isOwner[owner] = false;
        isOwner[newOwner] = true;
        emit OwnerRemoval(owner);
        emit OwnerAddition(newOwner);
    }

    /// @dev Allows to change the number of required confirmations. Transaction has to be sent by wallet.
    /// @param _required Number of required confirmations.
    function changeRequirement(uint _required)
        public
        onlyWallet
        validRequirement(owners.length, _required)
    {
        required = _required;
        emit RequirementChange(_required);
    }

    /// @dev Allows an owner to submit and confirm a transaction.
    /// @param destination Transaction target address.
    /// @param value Transaction ether value.
    /// @param data Transaction data payload.
    /// @return Returns transaction ID.
    function submitTransaction(address destination, uint value, bytes memory data, string memory proposal)
        public
        ownerExists(msg.sender)
        returns (uint transactionId)
    {
        transactionId = addTransaction(destination, value, data, proposal);
        confirmTransaction(transactionId);
    }

    /// @dev Allows an owner to confirm a transaction.
    /// @param transactionId Transaction ID.
    function confirmTransaction(uint transactionId)
        public
        ownerExists(msg.sender)
        transactionExists(transactionId)
        notConfirmed(transactionId, msg.sender)
    {
        confirmations[transactionId][msg.sender] = true;
        emit Confirmation(msg.sender, transactionId);
        executeTransaction(transactionId);
    }

    /// @dev Allows an owner to revoke a confirmation for a transaction.
    /// @param transactionId Transaction ID.
    function revokeConfirmation(uint transactionId)
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        confirmations[transactionId][msg.sender] = false;
        emit Revocation(msg.sender, transactionId);
    }

    /// @dev Allows anyone to execute a confirmed transaction.
    /// @param transactionId Transaction ID.
    function executeTransaction(uint transactionId)
        public
        ownerExists(msg.sender)
        confirmed(transactionId, msg.sender)
        notExecuted(transactionId)
    {
        if (isConfirmed(transactionId)) {
            Motion storage txn = motions[transactionId];
            txn.executed = true;
            if (external_call(txn.destination, txn.value, txn.data.length, txn.data)){
                emit Execution(transactionId);
            }
            else {
                emit ExecutionFailure(transactionId);
                txn.executed = false;
            }
        }
    }

    /// @dev Returns the confirmation status of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Confirmation status.
    function isConfirmed(uint transactionId)
        public
        view
        returns (bool)
    {
        uint count = 0;
        for (uint i = 0; i < owners.length; i++) {
            if (confirmations[transactionId][owners[i]]){
                count += 1;
            }
            if (count == required){
                return true;
            }
        }
    }

    /*
     * Internal functions
     */
    ///@dev call has been separated into its own function in order to take advantage of the Solidity's code generator
    ///to produce a loop that copies tx.data into memory.
    ///@param destination Address of transaction.
    ///@param value Ether attached to transaction.
    ///@param dataLength Length of parameter data.
    ///@param data Encoded transaction data.
    ///@return bool Success or failure of transaction
    function external_call(address destination, uint value, uint dataLength, bytes memory data)
        internal
        returns(bool)
    {
        bool result;
        assembly {
            let x := mload(0x40)   // "Allocate" memory for output (0x40 is where "free memory" pointer is stored by convention)
            let d := add(data, 32) // First 32 bytes are the padded length of data, so exclude that
            result := call(
                sub(gas, 34710),   // 34710 is the value that solidity is currently emitting
                // It includes callGas (700) + callVeryLow (3, to pay for SUB) + callValueTransferGas (9000) +
                // callNewAccountGas (25000, in case the destination address does not exist and needs creating)
                destination,
                value,
                d,
                dataLength,        // Size of the input (in bytes) - this is what fixes the padding problem
                x,
                0                  // Output is ignored, therefore the output size is zero
            )
        }
        return result;
    }

    ///@dev Overrides the MultiSigWallet struct transactions with motions
    ///@param proposal is an explanation of the transaction
    function addTransaction(address destination, uint value, bytes memory data, string memory proposal)
        internal
        notNull(destination)
        returns (uint transactionId)
    {
        transactionId = transactionCount;
        motions[transactionId] = Motion({
            destination: destination,
            value: value,
            data: data,
            executed: false,
            proposal: proposal
        });
        transactionCount += 1;
        emit Submission(transactionId);
    }

    /*
     * Getter functions
     */
    /// @dev Returns number of confirmations of a transaction.
    /// @param transactionId Transaction ID.
    /// @return Number of confirmations.
    function getConfirmationCount(uint transactionId)
        public
        view
        returns (uint count)
    {
        for (uint i = 0; i < owners.length; i++){
            if (confirmations[transactionId][owners[i]]){
                count += 1;
            }
        }
    }

    ///@dev Overrides the MultiSigWallet struct transactions with motions
    function getTransactionCount(bool pending, bool executed)
        public
        view
        returns (uint count)
    {
        for (uint i = 0; i < transactionCount; i++){
            if (pending && !motions[i].executed || executed && motions[i].executed){
                count += 1;
            }
        }
    }

    /// @dev Returns array with owner addresses, which confirmed transaction.
    /// @param transactionId Transaction ID.
    /// @return Returns array of owner addresses.
    function getConfirmations(uint transactionId)
        public
        view
        returns (address[] memory _confirmations)
    {
        address[] memory confirmationsTemp = new address[](owners.length);
        uint count = 0;
        uint i;
        for (i = 0; i < owners.length; i++){
            if (confirmations[transactionId][owners[i]]) {
                confirmationsTemp[count] = owners[i];
                count += 1;
            }
        }
        _confirmations = new address[](count);
        for (i = 0; i < count; i++){
            _confirmations[i] = confirmationsTemp[i];
        }
    }

    ///@dev Overrides the MultiSigWallet struct transactions with motions
    function getTransactionIds(uint from, uint to, bool pending, bool executed)
        public
        view
        returns (uint[] memory _transactionIds)
    {
        uint[] memory transactionIdsTemp = new uint[](transactionCount);
        uint count = 0;
        uint i;
        for (i = 0; i < transactionCount; i++){
            if (pending && motions[i].executed || executed && motions[i].executed) {
                transactionIdsTemp[count] = i;
                count += 1;
            }
        }
        _transactionIds = new uint[](to - from);
        for (i = from; i < to; i++){
            _transactionIds[i - from] = transactionIdsTemp[i];
        }
    }

    //@dev Returns owner count
    //@return uint of length owners
    function getOwnerCount()
        public
        view
        returns (uint)
    {
        return owners.length;
    }
}