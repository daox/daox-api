/*
    In this interface you can specify methods from DAO which you need to call in your service's functions
*/
pragma solidity 0.4.24;

interface IDAO {
    function votingPrice() view returns (uint);
}
