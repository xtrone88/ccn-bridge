const { ethers, upgrades } = require("hardhat")

async function main() {
  const BridgeContract = await ethers.getContractFactory("BridgeContract")
  const bridgeContract = await upgrades.deployProxy(BridgeContract, ["0x1ccd3930072bE5402501DdD9A5d70D4c9bCC275f", ["0xb21c5716b88b8ad98eEC3DAcfCdF31C1513028A8"]])
  await bridgeContract.deployed()
  console.log("BridgeContract deployed to:", bridgeContract.address)
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error)
    process.exit(1)
})