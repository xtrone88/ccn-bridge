const { ethers } = require("hardhat")

async function main() {
  const [owner, operator] = await ethers.getSigners()

  const Test = await ethers.getContractFactory("TestAdmin")
  const test = await Test.deploy()
  await test.deployed()

  console.log(await test.t())
  console.log('getSymbol', await test.getSymbol())
  await test.setContent("TEST")
  console.log('getContent', await test.content())
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })