import { rmSync } from 'node:fs';
import { join } from 'node:path';

const targets = [
  'apps/shape-hunt/.cache',
  'apps/shape-hunt/dist',
  'coverage',
  '.turbo',
  '.parcel-cache'
];

for (const target of targets) {
  rmSync(join(process.cwd(), target), { recursive: true, force: true });
}

console.log('Cleaned generated Shape Hunt artifacts. Local browser localStorage is not touched.');
