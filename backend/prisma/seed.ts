import { TicketStatus, Priority, Role } from '../generated/prisma/client';
import { prisma } from '../src/prismaClient';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Start seeding for Lab 4...');

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

  // Get user & relation records
  const anya = await prisma.user.findUnique({ where: { email: 'anya@example.com' } });
  const ben = await prisma.user.findUnique({ where: { email: 'ben@example.com' } });
  const it1 = await prisma.user.findUnique({ where: { email: 'it1@example.com' } });
  const it2 = await prisma.user.findUnique({ where: { email: 'it2@example.com' } });
  const it3 = await prisma.user.findUnique({ where: { email: 'it3@example.com' } });
  const itSupport = await prisma.category.findUnique({ where: { name: 'IT Support' } });
  const ms365 = await prisma.relatedSystem.findUnique({ where: { name: 'Microsoft 365' } });
  const sap = await prisma.relatedSystem.findUnique({ where: { name: 'SAP ERP' } });

  if (anya && ben && it1 && it2 && it3 && itSupport && ms365 && sap) {
    // 4. Seed Realistic Tickets with Fixed Numbers for Idempotency
    const sampleTickets = [
      {
        number: 'TKT-2026-00001',
        title: 'Workstation crashing with blue screen',
        description: 'Windows 11 workstation randomly freezes and shows blue screen MEMORY_MANAGEMENT error.',
        status: TicketStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        itPriority: Priority.URGENT,
        requesterId: anya.id,
        ticketOwnerId: it1.id,
        categoryId: itSupport.id,
        relatedSystemId: null,
      },
      {
        number: 'TKT-2026-00002',
        title: 'Cannot access Microsoft 365 email',
        description: 'Unable to sign in to Outlook on web; getting license expired message.',
        status: TicketStatus.OPEN,
        priority: Priority.MEDIUM,
        itPriority: Priority.MEDIUM,
        requesterId: anya.id,
        ticketOwnerId: it1.id,
        categoryId: itSupport.id,
        relatedSystemId: ms365.id,
      },
      {
        number: 'TKT-2026-00003',
        title: 'Need SAP PO approval role',
        description: 'Transferred to finance department, require SAP transaction authorization.',
        status: TicketStatus.WAITING_FOR_REQUESTER,
        priority: Priority.MEDIUM,
        itPriority: Priority.LOW,
        requesterId: anya.id,
        ticketOwnerId: it2.id,
        categoryId: itSupport.id,
        relatedSystemId: sap.id,
      },
      {
        number: 'TKT-2026-00004',
        title: 'VPN connection dropouts from home',
        description: 'VPN tunnel disconnects every 15 minutes during voice calls.',
        status: TicketStatus.RESOLVED,
        priority: Priority.LOW,
        itPriority: Priority.LOW,
        requesterId: anya.id,
        ticketOwnerId: it1.id,
        categoryId: itSupport.id,
        relatedSystemId: null,
      },
      {
        number: 'TKT-2026-00005',
        title: 'Printer paper jam and toner smudge on 3rd floor',
        description: 'HP LaserJet on 3rd floor office is jamming constantly.',
        status: TicketStatus.NEW,
        priority: Priority.LOW,
        itPriority: null,
        requesterId: ben.id,
        ticketOwnerId: null, // Unassigned
        categoryId: itSupport.id,
        relatedSystemId: null,
      },
      {
        number: 'TKT-2026-00006',
        title: 'New developer laptop provisioning request',
        description: 'Need standard Dell Latitude with Ubuntu for newly onboarded engineer.',
        status: TicketStatus.CLOSED,
        priority: Priority.HIGH,
        itPriority: Priority.HIGH,
        requesterId: ben.id,
        ticketOwnerId: it3.id,
        categoryId: itSupport.id,
        relatedSystemId: null,
      },
    ];

    for (const t of sampleTickets) {
      const ticket = await prisma.ticket.upsert({
        where: { number: t.number },
        update: {
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          itPriority: t.itPriority,
          requesterId: t.requesterId,
          ticketOwnerId: t.ticketOwnerId,
          categoryId: t.categoryId,
          relatedSystemId: t.relatedSystemId,
        },
        create: t,
      });

      // 5. Seed Actions Taken for Tickets
      // TKT-00001: Multiple Actions Taken by different IT Staff members
      if (ticket.number === 'TKT-2026-00001') {
        const existingActions = await prisma.actionTaken.count({ where: { ticketId: ticket.id } });
        if (existingActions === 0) {
          await prisma.actionTaken.createMany({
            data: [
              {
                ticketId: ticket.id,
                actionDateTime: new Date('2026-05-10T09:30:00Z'),
                actionDescription: 'Ran MemTest86 diagnostic suite; identified multiple memory errors on RAM slot 2.',
                result: 'Isolated faulty 8GB DDR4 RAM stick. System booted without crashing when stick removed.',
                performedById: it1.id,
                followUpRequired: true,
                followUpNote: 'Order replacement DDR4 8GB 3200MHz RAM module from vendor.',
                attachmentNotes: 'memtest-report-slot2.txt',
              },
              {
                ticketId: ticket.id,
                actionDateTime: new Date('2026-05-11T14:15:00Z'),
                actionDescription: 'Installed new certified RAM module into slot 2 and ran burn-in stress test for 3 hours.',
                result: 'Zero errors detected during prime95 test. OS stability confirmed.',
                performedById: it2.id, // Demonstrates different IT Staff member taking action
                followUpRequired: false,
                followUpNote: null,
                attachmentNotes: 'stress-test-pass.png',
              },
            ],
          });
          console.log('Seeded multiple Actions Taken for TKT-2026-00001');
        }
      }

      // TKT-00004: Exactly 1 Action Taken
      if (ticket.number === 'TKT-2026-00004') {
        const existingActions = await prisma.actionTaken.count({ where: { ticketId: ticket.id } });
        if (existingActions === 0) {
          await prisma.actionTaken.create({
            data: {
              ticketId: ticket.id,
              actionDateTime: new Date('2026-05-09T11:00:00Z'),
              actionDescription: 'Updated WireGuard VPN client to latest v0.5.3 build and adjusted MTU to 1380.',
              result: 'Tunnel connectivity stable over 2-hour continuous ping test.',
              performedById: it1.id,
              followUpRequired: false,
              followUpNote: null,
              attachmentNotes: null,
            },
          });
          console.log('Seeded 1 Action Taken for TKT-2026-00004');
        }
      }
      // TKT-00002, TKT-00003, TKT-00005: 0 Actions Taken (demonstrating zero-count / empty state)
    }
    console.log('Seeded sample tickets and Actions Taken');
  }

  console.log('Seeding finished successfully.');
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
