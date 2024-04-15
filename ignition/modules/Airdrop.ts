// import hre from 'hardhat';
// import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
// import ethereumAccounts from '../../data/ethereum-drop.json';
// import substrateAccounts from '../../data/substrate-drop.json';

// const AirdropModule = buildModule("AirdropModule", (m) => {
//   // TODO - move to params
//   const DROP_AT_ONCE = 10;
//   const DROP = hre.ethers.parseEther('1');
//   const VALUE = hre.ethers.parseEther('20');

//   const subChunks = chunkArray(substrateAccounts, DROP_AT_ONCE);
//   const ethChunks = chunkArray(ethereumAccounts, DROP_AT_ONCE);

//   const airdrop = m.contract("Airdrop", [DROP], {
//     value: VALUE,
//   });

//   for (const chunk of subChunks) {
//     m.call(airdrop, 'registerAllowedSub', [chunk], {});
//   }

//   return { airdrop };
// });

// function chunkArray<T>(inputArray: T[], chunkSize: number): T[][] {
//   if (chunkSize <= 0) {
//       throw new Error("chunkSize must be greater than 0");
//   }

//   const result: T[][] = [];
//   for (let i = 0; i < inputArray.length; i += chunkSize) {
//       const chunk = inputArray.slice(i, i + chunkSize);
//       result.push(chunk);
//   }
//   return result;
// }

// export default AirdropModule;
