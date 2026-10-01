import fs from 'fs';
import path from 'path';
import { syncStoreToPostgres } from '../src/services/dbSync';
import { prisma } from '../src/config/database';

async function main() {
  const storePath = path.resolve(__dirname, '../data/store.json');
  if (!fs.existsSync(storePath)) {
    console.error('store.json not found at', storePath);
    return;
  }

  const raw = fs.readFileSync(storePath, 'utf-8');
  const data = JSON.parse(raw);

  await syncStoreToPostgres(data);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
