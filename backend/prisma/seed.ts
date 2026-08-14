import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const CATEGORIES = [
  'Account and Access',
  'Hardware',
  'Software',
  'Network',
] as const;

async function main() {
  console.log('🌱 Seeding categories...');

  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✅ Category: "${category.name}" (id=${category.id})`);
  }

  console.log('🌱 Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
