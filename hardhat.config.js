require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require('@openzeppelin/hardhat-upgrades')
require("dotenv").config()
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.5.4",
  networks: {
    mainnet: {
      url: process.env.MAINNET_END_POINT,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    },
    huygen: {
      url: process.env.HUYGEN_URL,
      accounts: [
        process.env.HUYGEN_PRIVATE_KEY,
        process.env.HUYGEN_OPERATION_PRIVATE_KEY,
        process.env.HUYGEN_AUTHORIZED_PRIVATE_KEY,
        process.env.HUYGEN_USER_PRIVATE_KEY,
      ]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};
