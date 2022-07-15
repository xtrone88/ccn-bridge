require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require('@openzeppelin/hardhat-upgrades')
require("dotenv").config()
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    mainnet: {
      url: process.env.MAINNET_END_POINT,
      accounts: [process.env.MAINNET_PRIVATE_KEY]
    },
    rinkeby: {
      url: process.env.RINKEBY_END_POINT,
      accounts: [process.env.RINKEBY_PRIVATE_KEY]
    },
    bscTest: {
      url: process.env.BSC_TEST_URL || '',
      accounts: [process.env.BSC_PRIVATE_KEY]
    },
    ccnbeta: {
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
