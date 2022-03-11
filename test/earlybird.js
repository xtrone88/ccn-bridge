const { expect } = require("chai")
const { ethers, upgrades, waffle } = require("hardhat")
const { expectRevert } = require("@openzeppelin/test-helpers")
const ether = require("@openzeppelin/test-helpers/src/ether")

const BN = ethers.BigNumber.from

describe('EarlyBirdCollateral contract', function () {

    let owner, user, user2, user3
    let usdt, vault
    let decimals

    const toDecimal = function(value) {
        return BN(value).mul(BN(10).pow(decimals))
    }

    before(async () => {
        const [_owner, _user, _user2, _user3] = await ethers.getSigners()
        owner = _owner
        user = _user
        user2 = _user2
        user3 = _user3

        const USDT = await ethers.getContractFactory('TestERC20')
        usdt = await USDT.deploy()
        await usdt.deployed()
        
        decimals = await usdt.decimals()

        await usdt.transfer(user.address, toDecimal(200000))
        await usdt.transfer(user2.address, toDecimal(200000))
        await usdt.transfer(user3.address, toDecimal(200000))

        const Vault = await ethers.getContractFactory("EarlyBirdCollateral")
        vault = await Vault.deploy(usdt.address)
        await vault.deployed()
    })

    it('deposit-1', async () => {
        await usdt.connect(user).approve(vault.address, toDecimal(200000))
        await vault.connect(user).deposit(toDecimal(200000))
        expect(await usdt.balanceOf(vault.address)).to.equal(toDecimal(200000))
    })

    it('deposit-2', async () => {
        await usdt.connect(user2).approve(vault.address, toDecimal(200000))
        await vault.connect(user2).deposit(toDecimal(200000))
        expect(await usdt.balanceOf(vault.address)).to.equal(toDecimal(400000))
    })

    it('deposit-3', async () => {
        await usdt.connect(user3).approve(vault.address, toDecimal(200000))
        await vault.connect(user3).deposit(toDecimal(200000))
        expect(await usdt.balanceOf(vault.address)).to.equal(toDecimal(600000))
    })

    it('totalBalance', async () => {
        expect(await usdt.balanceOf(vault.address)).to.equal(await vault.totalBalance())
        expect(await vault.totalBalance()).to.equal(toDecimal(600000))
    })

    it('refund', async () => {
        await vault.connect(owner).refund(user.address, 2000000)
        expect(await usdt.balanceOf(user.address)).to.equal(66666800000)
        expect(await usdt.balanceOf(vault.address)).to.equal(533333200000)

        await vault.connect(owner).refund(user2.address, 1500000)
        expect(await usdt.balanceOf(user2.address)).to.equal(100000000000)
        expect(await usdt.balanceOf(vault.address)).to.equal(433333200000)

        await vault.connect(owner).refund(user3.address, 500000)
        expect(await usdt.balanceOf(user3.address)).to.equal(166666800000)
        expect(await usdt.balanceOf(vault.address)).to.equal(266666400000)
    })

    it('balances', async () => {
        expect(await vault.balances(user.address)).to.equal(133333200000)
        expect(await vault.balances(user2.address)).to.equal(100000000000)
        expect(await vault.balances(user3.address)).to.equal(33333200000)
    })

    it('userRefunded', async () => {
        expect(await vault.userRefunded(user.address)).to.equal(true)
        expect(await vault.userRefunded(user2.address)).to.equal(true)
        expect(await vault.userRefunded(user3.address)).to.equal(true)
    })

    it('deposit directly', async () => {
        await usdt.connect(user3).transfer(vault.address, toDecimal(30000))
        expect(await usdt.balanceOf(vault.address)).to.equal(296666400000)
    })

    it('withraw', async () => {
        await vault.connect(owner).withraw(toDecimal(100000))
        expect(await vault.totalBalance()).to.equal(196666400000)
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
        // await vault.connect(owner).refund(user.address, toDecimal(1));
    })
})