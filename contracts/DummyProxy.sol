/**
    This contract is needed only for tests. It imitates proxy contract which sends requests from dao to service and back.
*/
pragma solidity 0.4.24;

import "./TypesConverter.sol";

contract ProxyAPI {
    mapping(address => address) public availableCalls;

    function callService(address _address, bytes32 method, bytes32[10] args) external {
        availableCalls[_address] = msg.sender;
        string memory signature = getServiceSignature(method);
        require(_address.call(bytes4(keccak256(signature)), args), "Service call ended with error");
        availableCalls[_address] = 0x0;
    }

    function getServiceSignature(bytes32 method) private view returns(string){
        bytes memory concatenatedBytes = abi.encodePacked(TypesConverter.bytes32ToString(method), "(bytes32[10])");
        return string(concatenatedBytes);
    }

    function callDAOSetter(bytes32 method, bytes32 value) external {}
}
