/*
    This interface describes all needed functions from ProxyAPI contract.
*/
pragma solidity 0.4.24;

interface IProxyAPI {
    function availableCalls(address _this) constant returns(address);
    function callDAOSetter(bytes32 method, bytes32 value) external;
}
