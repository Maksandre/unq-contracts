import { ethers } from "hardhat";
import config from "../../config";
import fs from 'fs/promises';
import { Airdrop, Airdrop__factory } from '../../typechain-types';
import { getPublicKeyFromAddress } from "../../utils/subkeys";

type DropConfig = {
  settings: {
    drop: string,
    contractValue: string,
    dropAccountsAtOnce: number,
    blocksBetweenDrop: number,
    rpc: string
  },
  contract: `0x${string}`,
}

const CONFIG_FILE = `${__dirname}/config.json`;
const SUBSTRATE_TODO_FILE = `${__dirname}/data/substrate.txt`;
const SUBSTRATE_DONE_FILE = `${__dirname}/data/substrate-dropped.txt`;
const ETHEREUM_TODO_FILE = `${__dirname}/data/ethereum.txt`;
const ETHEREUM_DONE_FILE = `${__dirname}/data/ethereum-dropped.txt`;


const main = async () => {
  const dropConfig = await readConfig();
  const substrateAccounts = (await fs.readFile(SUBSTRATE_TODO_FILE)).toString().split('\n');
  const ethereumAccounts = (await fs.readFile(ETHEREUM_TODO_FILE)).toString().split('\n');
  const provider = new ethers.JsonRpcProvider(dropConfig.settings.rpc);
  const wallet = ethers.Wallet.fromPhrase(config.airdropMnemonic).connect(provider);

  const airdropContract = dropConfig.contract 
    ? Airdrop__factory.connect(dropConfig.contract, wallet)
    : await deployContract(dropConfig, substrateAccounts, ethereumAccounts);

  await dropForceSub(airdropContract, substrateAccounts, dropConfig);
  await dropForceEth(airdropContract, ethereumAccounts, dropConfig);
}

async function readConfig() {
  return JSON.parse((await fs.readFile(CONFIG_FILE)).toString()) as DropConfig;
}

async function deployContract(dropConfig: DropConfig, substrate: string[], ethereum: string[]) {
  const provider = new ethers.JsonRpcProvider(dropConfig.settings.rpc);
  const wallet = ethers.Wallet.fromPhrase(config.airdropMnemonic).connect(provider);

  if (dropConfig.contract) return Airdrop__factory.connect(dropConfig.contract);

  const REQUIRED_VALUE = ethers.parseEther(dropConfig.settings.drop) * ((BigInt(substrate.length) + BigInt(ethereum.length)));
  const WALLET_BALANCE = await provider.getBalance(wallet.address);
  {
    // 1. PRINT INFO ABOUT UPCOMING DROP
    console.log('Substrate accounts to drop:', substrate.length);
    console.log('Ethereum accounts to drop:', ethereum.length);
    console.log('Drop:', dropConfig.settings.drop);
    console.log('Required value:', ethers.formatEther(REQUIRED_VALUE));

    console.log('Wallet\'s address:', wallet.address);
    console.log('Wallet\'s balance:', ethers.formatEther(WALLET_BALANCE));

    // 1.1 TEST IS ENOUGH VALUE
    if (ethers.parseEther(dropConfig.settings.contractValue) < REQUIRED_VALUE) throw Error("Contract value not enough");
    if (WALLET_BALANCE < ethers.parseEther(dropConfig.settings.contractValue) + ethers.parseEther('3')) throw Error("Wallet balance not enough");

    const Airdrop = await ethers.getContractFactory("Airdrop");

    const contract = await Airdrop.connect(wallet).deploy(
      ethers.parseEther(dropConfig.settings.drop), 
      {
        gasLimit: 3_000_000,
        value: ethers.parseEther(dropConfig.settings.contractValue),
      }
    );
  
    await contract.waitForDeployment();
    const address = await contract.getAddress();
    await fs.writeFile(CONFIG_FILE, JSON.stringify({...dropConfig, ...{contract: address}}));

    return contract;
  }
}

async function dropForceSub(airdrop: Airdrop, substrate: string[], progress: DropConfig) {
  while (substrate.length > 0) {
    let accountsToDrop = substrate.splice(0, progress.settings.dropAccountsAtOnce).filter(a => a !== "");
    let publicKeys = accountsToDrop.map(getPublicKeyFromAddress);

    const dropTx = await airdrop.forceDropSub(publicKeys);
    await dropTx.wait();

    await fs.writeFile(SUBSTRATE_TODO_FILE, substrate.join('\n') + '\n');
    await fs.appendFile(SUBSTRATE_DONE_FILE, accountsToDrop.join('\n') + '\n');
  }
}

async function dropForceEth(airdrop: Airdrop, ethereum: string[], progress: DropConfig) {
  while (ethereum.length > 0) {
    let accountsToDrop = ethereum.splice(0, progress.settings.dropAccountsAtOnce).filter(a => a !== "");

    const dropTx = await airdrop.forceDropEth(accountsToDrop);
    await dropTx.wait();

    await fs.writeFile(ETHEREUM_TODO_FILE, ethereum.join('\n') + '\n');
    await fs.appendFile(ETHEREUM_DONE_FILE, accountsToDrop.join('\n') + '\n');
  }
}

main().catch(e => {
  console.log(e)
});
