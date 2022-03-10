const { expect } = require("chai")
const { ethers, upgrades, waffle } = require("hardhat")

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

        await usdt.transfer(user.address, 100)
        await usdt.transfer(user2.address, 100)
        await usdt.transfer(user3.address, 100)

        const Vault = await ethers.getContractFactory("TronVault")
        vault = await Vault.deploy(usdt.address)
        await vault.deployed()
    })

    it('deposit', async () => {
        await usdt.connect(user).approve(vault.address, 100)
        await vault.connect(user).deposit(100)
        expect(await usdt.balanceOf(vault.address)).to.equal(100)
    })

    it('loan', async () => {
        await vault.connect(owner).loan(user.address, 2)
        expect(await usdt.balanceOf(user.address)).to.equal(33)
        expect(await usdt.balanceOf(vault.address)).to.equal(67)

        await vault.connect(owner).loan(user.address, 1)
        expect(await usdt.balanceOf(user.address)).to.equal(77)
        expect(await usdt.balanceOf(vault.address)).to.equal(23)
    })

    it('deposit', async () => {
        await usdt.connect(user2).approve(vault.address, 100)
        await vault.connect(user2).deposit(100)
        expect(await usdt.balanceOf(vault.address)).to.equal(123)
    })

    it('loan', async () => {
        await vault.connect(owner).loan(user2.address, 2)
        expect(await usdt.balanceOf(user2.address)).to.equal(33)
        expect(await usdt.balanceOf(vault.address)).to.equal(90)

        await vault.connect(owner).loan(user.address, 1)
        expect(await usdt.balanceOf(user2.address)).to.equal(33)
        expect(await usdt.balanceOf(vault.address)).to.equal(75)
    })

    it('deposit', async () => {
        await usdt.connect(user3).approve(vault.address, 100)
        await vault.connect(user3).deposit(100)
        expect(await usdt.balanceOf(vault.address)).to.equal(175)
    })

    it('loan', async () => {
        await vault.connect(owner).loan(user3.address, 0)
        expect(await usdt.balanceOf(user3.address)).to.equal(100)
        expect(await usdt.balanceOf(vault.address)).to.equal(75)
    })

    it('withraw', async () => {
        await vault.connect(owner).withraw()
        expect(await usdt.balanceOf(vault.address)).to.equal(0)
    })
})