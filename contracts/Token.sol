/**
    This token contract is needed only for tests. It imitates DXC transfers.
*/
pragma solidity 0.4.24;

import '../node_modules/zeppelin-solidity/contracts/token/MintableToken.sol';

contract Token is MintableToken {
    string public name;
    string public symbol;
    uint constant public decimals = 18;

    constructor() {
        name = "TEST";
        symbol = "Test token";
    }

    function contributeTo(address _to, uint256 _amount) public {
        super.transfer(_to, _amount);
        require(_to.call(bytes4(keccak256("handleDXCPayment(address,uint256)")), msg.sender, _amount));
    }
}
