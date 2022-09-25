import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/types";
import { task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "hardhat-contract-sizer";
dotenv.config();

// Fetch constants from .env
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RINKEBY_URL = process.env.ALCHEMY_RINKEBY_URL;
const MUMBAI_URL = process.env.ALCHEMY_MUMBAI_URL;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const POLYGON_API_KEY = process.env.POLYGONSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [{ version: "0.8.9" }, { version: "0.6.6" }],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
      // gasPrice: 130000000000,
    },
    localhost: {
      // yarn hardhat node
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
    },
    polygonMumbai: {
      url: MUMBAI_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80001,
    },
  },
  etherscan: {
    apiKey: {
      rinkeby: ETHERSCAN_API_KEY,
      polygonMumbai: POLYGON_API_KEY,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: process.env.REPORT_CURRENCY,
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: process.env.REPORT_TOKEN,
  },
  mocha: {
    timeout: 200000, // Timeout at 200 seconds
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  contractSizer: {
    runOnCompile: true,
    strict: true,
  },
};

export default config;
