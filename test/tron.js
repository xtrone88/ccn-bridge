const { expect } = require("chai")
const { ethers, upgrades, waffle } = require("hardhat")
const { expectRevert } = require("@openzeppelin/test-helpers")


describe('TronVault contract', function () {

    let owner, user, user2, user3
    let usdt, vault
    let value

    before(async () => {
        const [_owner, _user, _user2, _user3] = await ethers.getSigners()
        owner = _owner
        user = _user
        user2 = _user2
        user3 = _user3
        
        const USDT = await ethers.getContractFactory('TestERC20')
        usdt = await USDT.deploy()
        await usdt.deployed()

        await usdt.transfer(user.address, 200000)
        await usdt.transfer(user2.address, 200000)
        await usdt.transfer(user3.address, 200000)

        const Vault = await ethers.getContractFactory("TronVault")
        vault = await Vault.deploy(usdt.address)
        await vault.deployed()
    })

    it('deposit-1', async () => {
        await usdt.connect(user).approve(vault.address, 200000)
        await vault.connect(user).deposit(200000)
        expect(await usdt.balanceOf(vault.address)).to.equal(200000)
    })

    it('deposit-2', async () => {
        await usdt.connect(user2).approve(vault.address, 200000)
        await vault.connect(user2).deposit(200000)
        expect(await usdt.balanceOf(vault.address)).to.equal(400000)
    })

    it('deposit-3', async () => {
        await usdt.connect(user3).approve(vault.address, 200000)
        await vault.connect(user3).deposit(200000)
        expect(await usdt.balanceOf(vault.address)).to.equal(600000)
    })

    it('totalBalance', async () => {
        expect(await usdt.balanceOf(vault.address)).to.equal(await vault.totalBalance())
        expect(await vault.totalBalance()).to.equal(600000)
    })

    it('refund', async () => {
        await vault.connect(owner).refund(user.address, 2)
        expect(await usdt.balanceOf(user.address)).to.equal(66680)
        expect(await usdt.balanceOf(vault.address)).to.equal(533320)

        await vault.connect(owner).refund(user2.address, 1)
        expect(await usdt.balanceOf(user2.address)).to.equal(133340)
        expect(await usdt.balanceOf(vault.address)).to.equal(399980)

        await vault.connect(owner).refund(user3.address, 0)
        expect(await usdt.balanceOf(user3.address)).to.equal(200000)
        expect(await usdt.balanceOf(vault.address)).to.equal(199980)
    })

    it('balances', async () => {
        expect(await vault.balances(user.address)).to.equal(133320)
        expect(await vault.balances(user2.address)).to.equal(66660)
        expect(await vault.balances(user3.address)).to.equal(0)
    })

    it('userRefunded', async () => {
        expect(await vault.userRefunded(user.address)).to.equal(true)
        expect(await vault.userRefunded(user2.address)).to.equal(true)
        expect(await vault.userRefunded(user3.address)).to.equal(true)
    })

    it('deposit directly', async () => {
        await usdt.connect(user3).transfer(vault.address, 200000)
        expect(await usdt.balanceOf(vault.address)).to.equal(399980)
    })

    it('withraw', async () => {
        await vault.connect(owner).withraw(100000)
        expect(await vault.totalBalance()).to.equal(299980)
    })

    it('withrawAll', async () => {
        await vault.connect(owner).withrawAll()
        expect(await vault.totalBalance()).to.equal(0)
    })

    it('refund again', async () => {
        // await expectRevert(
        //     vault.connect(owner).refund(user.address, 1),
        //     "Already refunded"
        // );
        // await vault.connect(owner).refund(user.address, 1);
    })
})