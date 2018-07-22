"use strict";

const TypesConverter = artifacts.require("./TypesConverter.sol");
const ExampleService = artifacts.require("./ExampleService.sol");
const Token = artifacts.require("./Token.sol");
const DummyProxy = artifacts.require("./ProxyAPI.sol");

const handleErrorTransaction = async (transaction) => {
    let error;

    try {
        await transaction();
    } catch (e) {
        error = e;
    } finally {
        assert.isDefined(error, "Revert was not thrown out");
    }
};

contract("ExampleService", accounts => {
    const service = ExampleService.at(ExampleService.address);
    const token = Token.at(Token.address);
    const proxy = DummyProxy.at(DummyProxy.address);
    const converter = TypesConverter.at(TypesConverter.address);
    let service2;

    it("Should create new service", async () => {
        service2 = await ExampleService.new(1, 2, Token.address, DummyProxy.address);

        assert.equal(1, (await service2.priceToConnect()).toNumber());
        assert.equal(2, (await service2.priceToCall()).toNumber());
        assert.equal(Token.address, await service2.DXC());
        assert.equal(DummyProxy.address, await service2.proxyAPI());
        assert.equal(accounts[0], await service2.owner());
        assert.isTrue(await service2.calledWithVoting("connect"));
    });

    it("Should handle payment and mark address as connected", async () => {
        await token.mint(accounts[0], 1);
        await token.contributeTo(service.address, await service.priceToConnect());

        assert.isTrue(await service.daos(accounts[0]));
        assert.equal(1, (await token.balanceOf(service.address)).toNumber())
    });

    it("Should not mark address as connected if payment is called not from DXC contract", async () => {
        await token.mint(accounts[1], 1);

        return handleErrorTransaction(async () => service.handleDXCPayment(accounts[1], (await service.priceToConnect())))
    });

    it("Should not mark address as connected if not enough tokens were transferred", async () => {
        await token.mint(accounts[2], 0.5);

        return handleErrorTransaction(async () => token.contributeTo(service.address, await service.priceToConnect(), {from: accounts[2]}))
    });

    it("Should increase call deposit if tokens were transferred from connected address", async () => {
        await token.mint(accounts[0], 3);
        await token.contributeTo(service2.address, await service2.priceToConnect());
        assert.isTrue(await service2.daos(accounts[0]));

        await token.contributeTo(service2.address, await service2.priceToCall());
        assert.equal(2, (await service2.callDeposit(accounts[0])).toNumber());
        assert.equal(3, (await token.balanceOf(service2.address)).toNumber())
    });

    it("Should not let to send less tokens than needed for one call", async () => {
        await token.mint(accounts[0], 1);

        return handleErrorTransaction(() => token.contributeTo(service2.address, 1));
    });

    it("Only owner can withdraw tokens from service", async () => {
        return handleErrorTransaction(() => service2.withdrawDXC(1, {from: accounts[1]}));
    });

    it("Owner can withdraw tokens from service", async () => {
        const balanceBefore = await token.balanceOf(accounts[0]);
        await service2.withdrawDXC(3);
        const balanceAfter = await token.balanceOf(accounts[0]);

        assert.deepEqual(balanceBefore, balanceAfter.minus(3));
    });

    it("Should be able to call `changeVotingPrice` method from service with paid calls", async () => {
        const callDepositBefore = await service2.callDeposit(accounts[0]);
        const bytes32Multiplier = await converter.uintToBytes32(2);
        const args = [bytes32Multiplier, web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null)];

        await proxy.callService(service2.address, "changeVotingPrice", args);

        assert.deepEqual(callDepositBefore, (await service2.callDeposit(accounts[0])).plus(await service2.priceToCall()));
    });

    it("Should be able to call `changeVotingPrice` method from service with free calls", async () => {
        assert.equal(0, (await service.callDeposit(accounts[0])).toNumber());
        const bytes32Multiplier = await converter.uintToBytes32(2);
        const args = [bytes32Multiplier, web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null)];

        await proxy.callService(service.address, "changeVotingPrice", args);
    });

    it("Should not be able to call service method from not proxy", async () => {
        const bytes32Multiplier = await converter.uintToBytes32(2);
        const args = [bytes32Multiplier, web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null)];

        return handleErrorTransaction(() => service.changeVotingPrice(args));
    });

    it("Should not be able to call service method from not connected address", async () => {
        const bytes32Multiplier = await converter.uintToBytes32(2);
        const args = [bytes32Multiplier, web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null)];

        return handleErrorTransaction(() => proxy.callService(service.address, "changeVotingPrice", args, {from: accounts[2]}));
    });

    it("Should not be able to call service method with insufficient call deposit", async () => {
        const bytes32Multiplier = await converter.uintToBytes32(2);
        const args = [bytes32Multiplier, web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null), web3.toHex(null)];

        return handleErrorTransaction(() => proxy.callService(service2.address, "changeVotingPrice", args));
    });
});