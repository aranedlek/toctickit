import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

// ─── Seed Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  'Account and Access',
  'Hardware',
  'Software',
  'Network',
] as const;

const RELATED_SYSTEMS = [
  'SAP ERP',
  'Microsoft 365',
  'Slack',
  'Google Workspace',
  'Jira',
  'Confluence',
] as const;

const REQUESTERS = [
  { name: 'Anya Suphan',   email: 'anya@example.com',   isActive: true },
  { name: 'Ben Rattana',   email: 'ben@example.com',    isActive: true },
  { name: 'Chanya Prom',   email: 'chanya@example.com', isActive: true },
  { name: 'Dome Wiriya',   email: 'dome@example.com',   isActive: true },
  { name: 'Eve Inactive',  email: 'eve@example.com',    isActive: false },
] as const;

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n');

  // Categories
  console.log('📂 Seeding categories...');
  for (const name of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✅ Category: "${category.name}" (id=${category.id})`);
  }

  // Related Systems
  console.log('\n🖥️  Seeding related systems...');
  for (const name of RELATED_SYSTEMS) {
    const system = await prisma.relatedSystem.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    console.log(`  ✅ RelatedSystem: "${system.name}" (id=${system.id})`);
  }

  // Requesters
  console.log('\n👤 Seeding requesters...');
  for (const { name, email, isActive } of REQUESTERS) {
    const requester = await prisma.requester.upsert({
      where: { email },
      update: { name, isActive },
      create: { name, email, isActive },
    });
    const status = requester.isActive ? '🟢 active' : '🔴 inactive';
    console.log(`  ✅ Requester: "${requester.name}" (id=${requester.id}) — ${status}`);
  }

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
