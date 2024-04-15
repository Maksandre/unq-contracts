import {config} from 'dotenv';
config();

const getConfig = () => {
  const { MAIN_ACCOUNT, AIRDROP_MNEMONIC } = process.env;

  if(!MAIN_ACCOUNT || !AIRDROP_MNEMONIC) {
    throw Error('Did you forget to sent .env?');
  }

  return {
    mainAccountSeed: MAIN_ACCOUNT,
    airdropMnemonic: AIRDROP_MNEMONIC,
  }
}

export default getConfig();
