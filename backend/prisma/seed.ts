import { PrismaClient, TicketStatus, Priority } from '../generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Seed Requesters
  const requesters = [
    { name: 'Anya Suphan', email: 'anya@example.com', isActive: true },
    { name: 'Ben Rattana', email: 'ben@example.com', isActive: true },
    { name: 'Chanya Prom', email: 'chanya@example.com', isActive: true },
    { name: 'Dome Wiriya', email: 'dome@example.com', isActive: true },
    { name: 'Eve Inactive', email: 'eve@example.com', isActive: false },
  ];

  for (const requester of requesters) {
    await prisma.requester.upsert({
      where: { email: requester.email },
      update: {},
      create: requester,
    });
  }
  console.log('Seeded Requesters');

  // 2. Seed Categories
  const categories = ['IT Support', 'HR Request', 'Finance', 'Facilities'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }
  console.log('Seeded Categories');

  // 3. Seed Related Systems
  const systems = [
    'SAP ERP',
    'Microsoft 365',
    'Slack',
    'Google Workspace',
    'Jira',
    'Confluence',
  ];
  for (const sysName of systems) {
    await prisma.relatedSystem.upsert({
      where: { name: sysName },
      update: {},
      create: { name: sysName },
    });
  }
  console.log('Seeded Related Systems');

  // 4. Seed Sample Tickets for Anya
  const anya = await prisma.requester.findUnique({
    where: { email: 'anya@example.com' },
  });
  const itSupport = await prisma.category.findUnique({
    where: { name: 'IT Support' },
  });
  const ms365 = await prisma.relatedSystem.findUnique({
    where: { name: 'Microsoft 365' },
  });
  const sap = await prisma.relatedSystem.findUnique({
    where: { name: 'SAP ERP' },
  });

  if (anya && itSupport && ms365 && sap) {
    // Only seed tickets if Anya doesn't have any yet
    const existingTickets = await prisma.ticket.count({
      where: { requesterId: anya.id },
    });

    if (existingTickets === 0) {
      await prisma.ticket.createMany({
        data: [
          {
            title: 'Cannot access email',
            description: 'I have been unable to log into my email since this morning.',
            status: TicketStatus.OPEN,
            priority: Priority.HIGH,
            requesterId: anya.id,
            categoryId: itSupport.id,
            relatedSystemId: ms365.id,
          },
          {
            title: 'Need access to SAP',
            description: 'I need to approve a purchase order but lack access.',
            status: TicketStatus.IN_PROGRESS,
            priority: Priority.MEDIUM,
            requesterId: anya.id,
            categoryId: itSupport.id,
            relatedSystemId: sap.id,
          },
          {
            title: 'VPN is very slow',
            description: 'When working from home, the VPN disconnects frequently.',
            status: TicketStatus.RESOLVED,
            priority: Priority.LOW,
            requesterId: anya.id,
            categoryId: itSupport.id,
            relatedSystemId: null, // no specific system
          },
        ],
      });
      console.log('Seeded Sample Tickets for Anya');
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
