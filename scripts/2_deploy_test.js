const { assert } = require("chai")
const { ethers, upgrades } = require("hardhat")

async function main() {
  const [owner, operation, authorized, user] = await ethers.getSigners()
  
  console.log("1. USDM deploying...")
  const ERC20 = await ethers.getContractFactory('TetherToken')
  erc20 = await ERC20.deploy(1000000000000, 'tether', 'usdm', 4)
  await erc20.deployed()
  console.log("> OK: USDM deployed to:", erc20.address)

  console.log("2 USDM send to authorized account...")
  await erc20.transfer(authorized.address, 100000000)
  assert.strictEqual((await erc20.balanceOf(authorized.address)).toString(), '100000000')
  console.log("> OK: USDM sent to authorized account")

  console.log("3 USDM send to user account...")
  await erc20.transfer(user.address, 100000000)
  assert.strictEqual((await erc20.balanceOf(user.address)).toString(), '100000000')
  console.log("> OK: USDM sent to user account")

  console.log("4. CCNWRAP deploying...")
  const CCNWRAP = await ethers.getContractFactory('TestERC20')
  ccnwrap = await CCNWRAP.deploy()
  await ccnwrap.deployed()
  console.log("> OK: CCNWRAP deployed to:", ccnwrap.address)

  console.log("5. CCNWRAP send to authorized account...")
  await ccnwrap.transfer(authorized.address, 100000000)
  assert.strictEqual((await ccnwrap.balanceOf(authorized.address)).toString(), '100000000')
  console.log("> OK: CCNWRAP sent to authorized account")

  console.log("6. CCNWRAP send to user account...")
  await ccnwrap.transfer(user.address, 100000000)
  assert.strictEqual((await ccnwrap.balanceOf(user.address)).toString(), '100000000')
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

  const coinAddress = '0x0000000000000000000000000000000000000000'
  const ccnWrapAddress = ccnwrap.address
  const erc20Address = erc20.address
  
  console.log("8. setCrossChainFee calling...")
  await bridgeContract.connect(operation).setCrossChainFee(coinAddress, 100000000)
  assert.strictEqual((await bridgeContract.crossChainFee(coinAddress)).toString(), '100000000')

  await bridgeContract.connect(operation).setCrossChainFee(ccnWrapAddress, 10)
  assert.strictEqual((await bridgeContract.crossChainFee(ccnWrapAddress)).toString(), '10')

  await bridgeContract.connect(operation).setCrossChainFee(erc20Address, 10)
  assert.strictEqual((await bridgeContract.crossChainFee(erc20Address)).toString(), '10')
  console.log("> OK: setCrossChainFee called")
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})