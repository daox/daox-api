const Token = artifacts.require("./Token.sol");
const TypesConverter = artifacts.require("./TypesConverter.sol");
const ExampleService = artifacts.require("./ExampleService.sol");
const DummyProxy = artifacts.require("./ProxyAPI.sol");

module.exports = (deployer) => {
    deployer.deploy(TypesConverter)
        .then(() => deployer.deploy(Token))
        .then(() => deployer.link(TypesConverter, DummyProxy))
        .then(() => deployer.deploy(DummyProxy))
        .then(() => deployer.link(TypesConverter, ExampleService))
        .then(() => deployer.deploy(ExampleService, 1, 0, Token.address, DummyProxy.address));
};

