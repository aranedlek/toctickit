import { TicketStatus, Priority, Role } from '../generated/prisma/client';
import { prisma } from '../src/prismaClient';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding...');

  // Create a default hashed password for all seed users: "Password123!"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Seed Users (Requesters, IT Staff, Admin)
  const users = [
    // Requesters
    { name: 'Aran Edlek', email: 'aran@example.com', role: Role.REQUESTER, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'Anya Suphan', email: 'anya@example.com', role: Role.REQUESTER, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'Ben Rattana', email: 'ben@example.com', role: Role.REQUESTER, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'Chanya Prom', email: 'chanya@example.com', role: Role.REQUESTER, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'Eve Inactive', email: 'eve@example.com', role: Role.REQUESTER, isActive: false, passwordHash, requiresPasswordChange: false },
    
    // IT Staff
    { name: 'IT Staff One', email: 'it1@example.com', role: Role.IT_STAFF, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'IT Staff Two', email: 'it2@example.com', role: Role.IT_STAFF, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'IT Staff Three', email: 'it3@example.com', role: Role.IT_STAFF, isActive: true, passwordHash, requiresPasswordChange: false },
    { name: 'IT Staff Inactive', email: 'it-inactive@example.com', role: Role.IT_STAFF, isActive: false, passwordHash, requiresPasswordChange: false },

    // Administrator
    { name: 'Admin User', email: 'admin@example.com', role: Role.ADMINISTRATOR, isActive: true, passwordHash, requiresPasswordChange: false },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
  console.log('Seeded Users');

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
  const anya = await prisma.user.findUnique({
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
            relatedSystemId: null,
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
