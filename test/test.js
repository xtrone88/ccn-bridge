const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

describe('Bridge contract', function () {

    let owner, operation, authorized, receiver
    let erc20, bridge

    before(async () => {
        const ERC20 = await ethers.getContractFactory('TestERC20')
        erc20 = await ERC20.deploy()
        await erc20.deployed()

        const [_owner, _operation, _authorized, _receiver] = await ethers.getSigners()
        owner = _owner
        operation = _operation
        authorized = _authorized
        receiver = _receiver

        const Bridge = await ethers.getContractFactory("BridgeContract")
        bridge = await upgrades.deployProxy(Bridge, [operation.address, [authorized.address]])
        await bridge.deployed()
    })

    it('deposit', async () => {
        await erc20.approve(bridge.address, 100)
        await bridge.deposit(erc20.address, 100, receiver.address)
        expect(await erc20.balanceOf(bridge.address)).to.equal(100)
    })

    // it('addAvailableBalance', async () => {
    //     await bridge.addAvailableBalance(erc20.address, 100, receiver.address)
    //     expect(await bridge.availableBalanceOf(receiver.address, erc20.address)).to.equal(100)
    // })

    it('addAvailableBalanceWithAdjustmentQuota', async () => {
        await bridge.connect(authorized).resetBalanceAdjustmentQuota(erc20.address, 1000)
        expect(await bridge.balanceAdjustmentQuotaOf(erc20.address)).to.equal(1000)

        await bridge.addAvailableBalanceWithAdjustmentQuota(erc20.address, 100, receiver.address)
        expect(await bridge.availableBalanceOf(receiver.address, erc20.address)).to.equal(100)
    })

    // it('withraw', async () => {
    //     await bridge.connect(receiver).withraw(erc20.address, 50)
    //     expect(await erc20.balanceOf(receiver.address)).to.equal(50)
    //     expect(await bridge.availableBalanceOf(receiver.address, erc20.address)).to.equal(150)
    //     expect(await bridge.totalAvailableBalanceOf(erc20.address)).to.equal(150)
    // })

    // it('withrawAll', async () => {
    //     await bridge.connect(owner).withrawAll(erc20.address)
    //     expect(await erc20.balanceOf(owner.address)).to.equal(9900)
    // })

    it('inject', async () => {
        await erc20.connect(owner).transfer(authorized.address, 500)
        await erc20.connect(authorized).approve(bridge.address, 150)
        await bridge.connect(authorized).inject(erc20.address, 150)
        expect(await erc20.balanceOf(bridge.address)).to.equal(150)
    })
})