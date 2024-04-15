import { decodeAddress } from '@polkadot/util-crypto';

export function getPublicKeyFromAddress(address: string): string {
  const publicKey = decodeAddress(address);
  return `0x${Buffer.from(publicKey).toString('hex')}`;
}
