import hre from "hardhat";
import substrateAccounts from '../data/substrate-drop.json';

describe("Airdrop", function () {
  it("Should set the right unlockTime", async function () {
    const [owner] = await hre.ethers.getSigners();
    const DROP_AT_ONCE = 10;
    const DROP = hre.ethers.parseEther('1');
    const VALUE =  hre.ethers.parseEther('20');
  
    const subChunks = chunkArray(substrateAccounts, DROP_AT_ONCE);

    
    const AirdropFactory = await hre.ethers.getContractFactory('Airdrop');
    const airdrop = await AirdropFactory.deploy(DROP, {value: VALUE});
    

    for (const chunk of subChunks) {
      await airdrop.registerAllowedSub([chunk.map(c => BigInt(c))]);
    }

    console.log(">>>>>");
    console.log(airdrop.address);
  });
});


function chunkArray<T>(inputArray: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
      throw new Error("chunkSize must be greater than 0");
  }

  const result: T[][] = [];
  for (let i = 0; i < inputArray.length; i += chunkSize) {
      const chunk = inputArray.slice(i, i + chunkSize);
      result.push(chunk);
  }
  return result;
}
