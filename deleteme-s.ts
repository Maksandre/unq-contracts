import data from './deleteme';
import fs from 'fs/promises';

const main = async () => {
  const owners = data.data.token_owners.data.map((d: any) => d.owner);
  const substrate = owners.filter(o => o.startsWith('un'));
  const ethereum = owners.filter(o => o.startsWith('0x'));
  if (substrate.length + ethereum.length !== owners.length) throw Error('Not EQ');
  await fs.writeFile('./substrate.txt', JSON.stringify(substrate.toString()), 'utf-8');
  await fs.writeFile('./ethereum.txt', JSON.stringify(ethereum.toString()), 'utf-8');
}

main();