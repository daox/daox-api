# Daox Service API 

[![Build Status](https://travis-ci.org/daox/daox-api.svg?branch=master)](https://travis-ci.org/daox/daox-api)

This repo contains Solidity smart contracts that can be used to create external services which can connect via API with [Daox DAOs](https://github.com/daox/daox-contracts).
Daox-based DAOs will be able to connect service and use it to extend functionality. 
Service's creator can make connection of his service to DAO or every call to the service's methods paid. 
DAO will send DXC tokens to service in the amount indicated in services properties `priceToConnect` and `priceToCall`.
Prices can be set to 0 if service must be free to use.


Install
-------
## Github

### Clone the repository:
```bash
git clone https://github.com/daox/daox-api.git
cd daox-api
```

### Install requirements with npm:
```bash
npm i
```

### Import needed contracts
Needed contracts now can be imported like this:
```solidity
import './daox-api/contracts/BaseService.sol';
```

## NPM

### Install package using npm
```bash
npm i -S daox-api
```

### Import needed contracts
Needed contracts now can be imported like this:
```solidity
import '../node_modules/daox-api/contracts/BaseService.sol';
```

Running tests
-------------
### Go to directory

```bash 
cd /path/to/daox/api
```

### Install truffle and ganache-cli for testing and compiling:

```bash
npm i -g truffle ganache-cli
```

### Run all tests (will automatically run ganache-cli in the background):

```bash
npm test
```

Compile
-------
### Compile all contracts:

```bash
truffle compile
```

Details
-------
### Contracts description
This repository contains several contracts. Some of them are needed to create your own service and some of them are needed only for tests.

**List of contracts:**
1. [BaseService.sol](https://github.com/daox/daox-api/blob/master/contracts/BaseService.sol) — this contract contains all common functionality and must be inherited by your service. 
It contains functions to connect DAOs, handle payments, withdraw tokens and e.t.c.
It also contains several common modifiers which can be used in your service

2. [DummyProxy.sol](https://github.com/daox/daox-api/blob/master/contracts/DummyProxy.sol) — this contract is needed only for tests. It imitates proxy contract which sends requests from dao to service and back.

3. [ExampleService.sol](https://github.com/daox/daox-api/blob/master/contracts/ExampleService.sol) — contains an example of service and can be used to get understanding of how service contract should look like

4. [IDAO.sol](https://github.com/daox/daox-api/blob/master/contracts/ExampleService.sol) — interface which must be used to describe functions and public properties inside DAOs that will be called from service.
For example, if service needs to know voting price inside DAO this property should be describe in IDAO interface as public function.
Than needed property can be called from service like so:
    ```
    uint daoVotingPrice = IDAO(daoAddress).votingPrice();
    ```
5. [IProxyAPI.sol](https://github.com/daox/daox-api/blob/master/contracts/IProxyAPI.sol) — contains interface which describes all needed functions from ProxyAPI contract.

6. [Token.sol](https://github.com/daox/daox-api/blob/master/contracts/Token.sol) — this contract is needed only for tests. It imitates DXC transfers.

7. [TypesConverter.sol](https://github.com/daox/daox-api/blob/master/contracts/TypesConverter.sol) —  a special library created to convert most common types in solidity to bytes32 and back.
It is used to convert arguments from bytes32 array which is provided to service's method to needed type 
and than convert arguments for DAO's setters to bytes32. For example, if you know that the first element of `args` array must be uint than you can convert it to uint like so: 
    ```
    uint uintFoo = TypesConverter.bytes32ToUint(args[0]);
    ```
    And when you are ready to send some value, for example string, to DAO's setter, you can convert needed string to bytes32 like following:
    ```
    bytes32 bytes32Bar = TypesConverter.stringToBytes32(strValue);
    ```

Getting Started
---------------
1. Create .sol file which will contain code of your service
2. Import `BaseService` to your contract and make you service extend it
3. Import `TypesConverter`, `IProxyAPI` and `IDAO`
4. Done! Now you can start creating your functions which will extend Daox-based DAOs functionality or change behaviour of existing functionality.
Before deploying to mainnet you should think about price for connecting and using your service and pass it to constructor.

Questions
---------
For any questions about using API or creating service for Daox you can contact us via email: 
[info@daox.org](mailto:info@daox.org) or [vityazevanton@gmail.com](mailto:vityazevanton@gmail.com)
If you have questions that may require a lengthy discussion or you have any suggestions you can create a topic on our [developers forum](https://research.daox.org)
and we will definitely discuss it!


License
-------
 All smart contracts are released under MIT.

Contributors
------------
- Anton Vityazev ([GiddeonWyeth](https://github.com/GiddeonWyeth))
