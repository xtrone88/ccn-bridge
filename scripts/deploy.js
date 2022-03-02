const { ethers, upgrades } = require("hardhat")
require('dotenv').config()

async function main() {
  const BridgeContract = await ethers.getContractFactory("BridgeContract")
  const bridgeContract = await upgrades.deployProxy(BridgeContract, [])
  await bridgeContract.deployed()
  console.log("BridgeContract deployed to:", bridgeContract.address)
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})