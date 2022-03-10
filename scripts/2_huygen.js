const { expect } = require("chai")
const { ethers, upgrades } = require("hardhat")

async function main() {
  const [owner, operation, authorized, user] = await ethers.getSigners()
  
  // const erc20 = await ethers.getContractAt('TetherToken', '0xe8b0CC9d7E29e43Ba970974df8603E02a9FfC0A3')
  // const ccnwrap = await ethers.getContractAt('TestERC20', '0xf3472c146D65bf691631c6c37B9442D18f15Cfda')
  // const bridgeContract = await ethers.getContractAt('BridgeContract', '0x7D3C120B51601a234f320fB7147B16b895513b39')
  
  const coinAddress = '0x0000000000000000000000000000000000000000'
  const targetAddress = '0x90F79bf6EB2c4f870365E785982E1f101E93b906'

  console.log("1. USDM deploying...")
  const ERC20 = await ethers.getContractFactory('TetherToken')
  erc20 = await ERC20.deploy(1000000000000, 'tether', 'usdm', 4)
  await erc20.deployed()
  console.log("> OK: USDM deployed to:", erc20.address)

  console.log("2 USDM send to authorized account...")
  await erc20.transfer(authorized.address, 100000000)
  expect(await erc20.balanceOf(authorized.address)).to.equal(100000000)
  console.log("> OK: USDM sent to authorized account")

  console.log("3 USDM send to user account...")
  await erc20.transfer(user.address, 100000000)
  expect(await erc20.balanceOf(user.address)).to.equal(100000000)
  console.log("> OK: USDM sent to user account")

  console.log("4. CCNWRAP deploying...")
  const CCNWRAP = await ethers.getContractFactory('TestERC20')
  ccnwrap = await CCNWRAP.deploy()
  await ccnwrap.deployed()
  console.log("> OK: CCNWRAP deployed to:", ccnwrap.address)

  console.log("5. CCNWRAP send to authorized account...")
  await ccnwrap.transfer(authorized.address, 100000000)
  expect(await ccnwrap.balanceOf(authorized.address)).to.equal(100000000)
  console.log("> OK: CCNWRAP sent to authorized account")

  console.log("6. CCNWRAP send to user account...")
  await ccnwrap.transfer(user.address, 100000000)
  expect(await ccnwrap.balanceOf(user.address)).to.equal(100000000)
  console.log("> OK: CCNWRAP sent to user account")

  console.log("7. BridgeContract deploying...")
  const BridgeContract = await ethers.getContractFactory("BridgeContract")
  const bridgeContract = await upgrades.deployProxy(BridgeContract, [
    operation.address,
    ccnwrap.address,
    authorized.address
  ])
  await bridgeContract.deployed()
  console.log("> OK: BridgeContract deployed to:", bridgeContract.address)

  console.log("8. setCrossChainFee calling...")
  await bridgeContract.connect(operation).setCrossChainFee(coinAddress, 100000000)
  expect(await bridgeContract.crossChainFee(coinAddress)).to.equal(100000000)

  await bridgeContract.connect(operation).setCrossChainFee(ccnwrap.address, 10)
  expect(await bridgeContract.crossChainFee(ccnwrap.address)).to.equal(10)

  await bridgeContract.connect(operation).setCrossChainFee(erc20.address, 10)
  expect(await bridgeContract.crossChainFee(erc20.address)).to.equal(10)
  console.log("> OK: setCrossChainFee called")

  console.log("9. deposit with ERC20...")
  await erc20.connect(user).approve(bridgeContract.address, 100)
  await bridgeContract.connect(user).deposit(erc20.address, 100, targetAddress)
  expect(await erc20.balanceOf(bridgeContract.address)).to.equal(100)
  console.log("> OK: deposit with ERC20")

  console.log("10. deposit with CCNWrap...")
  await ccnwrap.connect(user).approve(bridgeContract.address, 100)
  await bridgeContract.connect(user).deposit(ccnwrap.address, 100, targetAddress)
  expect(await ccnwrap.balanceOf(bridgeContract.address)).to.equal(100)
  console.log("> OK: deposit with CCNWrap")

  console.log("11. deposit with Coin...")
  await bridgeContract.connect(user).depositWithCoin(targetAddress, {value: ethers.BigNumber.from(10000000000)})
  expect(await waffle.provider.getBalance(bridgeContract.address)).to.equal(10000000000)
  console.log("> OK: deposit with Coin")

  console.log("12. addAvailableBalanceWithAdjustmentQuota: erc20->erc20...")
  await bridgeContract.connect(authorized).resetBalanceAdjustmentQuota(erc20.address, 1000)
  expect(await bridgeContract.balanceAdjustmentQuota(erc20.address)).to.equal(1000)

  await bridgeContract.connect(operation).addAvailableBalanceWithAdjustmentQuota(erc20.address, 100, targetAddress)
  expect(await erc20.balanceOf(targetAddress)).to.equal(90)
  console.log("> OK: addAvailableBalanceWithAdjustmentQuota: erc20->erc20")

  console.log("13. addAvailableBalanceWithAdjustmentQuota: wrap->coin...")
  await bridgeContract.connect(authorized).resetBalanceAdjustmentQuota(ccnwrap.address, 1000)
  expect(await bridgeContract.balanceAdjustmentQuota(ccnwrap.address)).to.equal(1000)

  await bridgeContract.connect(operation).addAvailableBalanceWithAdjustmentQuota(ccnwrap.address, 100, targetAddress)
  expect(await ccnwrap.balanceOf(targetAddress)).to.equal(90)
  console.log("> OK: addAvailableBalanceWithAdjustmentQuota: wrap->coin")

  console.log("14. addAvailableBalanceWithAdjustmentQuota : coin->wrap...")
  await bridgeContract.connect(authorized).resetBalanceAdjustmentQuota(coinAddress, ethers.utils.parseEther("10"))
  expect(await bridgeContract.balanceAdjustmentQuota(coinAddress)).to.equal(ethers.utils.parseEther("10"))

  const targetBalance = await waffle.provider.getBalance(targetAddress)
  await bridgeContract.connect(operation).addAvailableBalanceWithAdjustmentQuota(coinAddress, 10000000000, targetAddress)
  expect(await waffle.provider.getBalance(targetAddress)).to.equal(ethers.BigNumber.from(9900000000).add(targetBalance))
  console.log("> OK: addAvailableBalanceWithAdjustmentQuota : coin->wrap...")

  console.log("15. inject : erc20...")
  await erc20.connect(authorized).approve(bridgeContract.address, 150)
  await bridgeContract.connect(authorized).inject(erc20.address, 150)
  expect(await erc20.balanceOf(bridgeContract.address)).to.equal(160)
  console.log("> OK: inject : erc20")

  console.log("16. inject : CCNWrap...")
  await ccnwrap.connect(authorized).approve(bridgeContract.address, 150)
  await bridgeContract.connect(authorized).inject(ccnwrap.address, 150)
  expect(await ccnwrap.balanceOf(bridgeContract.address)).to.equal(160)
  console.log("> OK: inject : CCNWrap")

  console.log("17. inject : Coin...")
  const bridgeBalance = await waffle.provider.getBalance(bridgeContract.address)
  await bridgeContract.connect(authorized).inject(coinAddress, 1000000000000, {value: ethers.BigNumber.from(1000000000000)})
  expect(await waffle.provider.getBalance(bridgeContract.address)).to.equal(ethers.BigNumber.from(1000000000000).add(bridgeBalance))
  console.log("> OK: inject : Coin")

  console.log("18. Withraw...")
  console.log('Chain Fee (COIN): ', (await bridgeContract.balanceCrossChainFee(coinAddress)).toString())
  await bridgeContract.withraw(coinAddress, await bridgeContract.balanceCrossChainFee(coinAddress))
  expect(await bridgeContract.balanceCrossChainFee(coinAddress)).to.equal(0)

  console.log('Chain Fee (ERC20): ', (await bridgeContract.balanceCrossChainFee(erc20.address)).toString())
  await bridgeContract.withraw(erc20.address, await bridgeContract.balanceCrossChainFee(erc20.address))
  expect(await bridgeContract.balanceCrossChainFee(erc20.address)).to.equal(0)

  console.log('Chain Fee (CCNWrap): ', (await bridgeContract.balanceCrossChainFee(ccnwrap.address)).toString())
  await bridgeContract.withraw(ccnwrap.address, await bridgeContract.balanceCrossChainFee(ccnwrap.address))
  expect(await bridgeContract.balanceCrossChainFee(ccnwrap.address)).to.equal(0)
  console.log("> OK: Withraw")
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})