pragma solidity 0.4.24;

import "./IProxyAPI.sol";

interface IDXC {
    function transfer(address to, uint256 value) public returns (bool);
}

contract BaseService {
    /* Address of DXC Token contract */
    address public DXC;
    address public owner;
    /* Address of proxyAPI contract which provides interaction between DAOs and service */
    address public proxyAPI;
    /* Price in DXC which DAO must pay to connect service. Can be set to 0 if you want to make connection of your service free */
    uint public priceToConnect;
    /* Price in DXC which DAO must pay to call service's method. Can be set to 0 if you want to make calls to your service free */
    uint public priceToCall;
    /* List of DAOs which connected service */
    mapping(address => bool) public daos;
    /* Amount of DXC that specific address provided to call methods from service */
    mapping(address => uint) public callDeposit;
    /* Names of methods that must be called from DAO only after voting. This mapping should contain methods that can modify important/critical properties of DAO */
    mapping(bytes32 => bool) public calledWithVoting;

    constructor(uint _priceToConnect, uint _priceToCall, address _DXC, address _proxyAPI) public {
        owner = msg.sender;
        priceToConnect = _priceToConnect;
        priceToCall = _priceToCall;
        DXC = _DXC;
        proxyAPI = _proxyAPI;
        calledWithVoting["connect"] = true;
    }

    /*
    * @dev Receives info about address which sent DXC tokens to current contract and about amount of sent tokens
    * @param _from Address which sent DXC to service
    * @param _amount Amount of DXC tokens which were sent
    */
    function handleDXCPayment(address _from, uint _amount) external correctPayment(_amount, daos[_from]) onlyDXC {
        if(!daos[_from]) daos[_from] = true;
        else callDeposit[_from] += _amount;
    }

    /*
    * @dev Allows owner of service to withdraw DXC tokens which were sent to service as payment
    * @param _amount Amount of DXC tokens which needs to be withdrawn
    */
    function withdrawDXC(uint _amount) public onlyOwner {
        IDXC(DXC).transfer(msg.sender, _amount);
    }

    /*
    * @dev Checks that the number of tokens which were sent to service is enough for needed action
    * @param _amount Amount of DXC tokens which were sent
    * @param _connected Flag indicating if DAO which called service is already connected or not
    */
    modifier correctPayment(uint _amount, bool _connected) {
        uint price = _connected ? priceToCall : priceToConnect;
        require(_amount == price, "Incorrect number of DXC was transferred");
        _;
    }

    /*
    * @dev Checks that method is called by the owner of service
    */
    modifier onlyOwner {
        require(msg.sender == owner, "Method can be called only by owner");
        _;
    }

    /*
    * @dev Checks that method is called by DXC contract
    */
    modifier onlyDXC {
        require(msg.sender == DXC, "Method can be called only by DXC contract");
        _;
    }

    /*
    * @dev Checks that method is called by ProxyAPI contract
    */
    modifier onlyProxyAPI {
        require(msg.sender == proxyAPI, "Method can be call only from Daox API proxy contract");
        _;
    }

    /*
    * @dev Checks that method is called by the address which connected service
    */
    modifier onlyConnected {
        address dao = IProxyAPI(msg.sender).availableCalls(this);
        require(daos[dao], "Service is not connected");
        _;
    }

    /*
    * @dev Checks that address has enough tokens in deposit to call service's method
    */
    modifier canCall {
        address dao = IProxyAPI(msg.sender).availableCalls(this);
        require(callDeposit[dao] >= priceToCall, "Not enough funds deposited to make a call");
        _;
    }
}
