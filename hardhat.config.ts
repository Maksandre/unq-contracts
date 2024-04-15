import appConfig from "./config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.16",
  networks: {
    local: {
      url: "http://127.0.0.1:8545",
    },
    opal: {
      url: "https://rpc-opal.unique.network/",
      accounts: [appConfig.mainAccountSeed]
    },
  },

};

export default config;
