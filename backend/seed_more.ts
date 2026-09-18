import { TicketStatus, Priority } from './generated/prisma/client';
import { prisma } from './src/prismaClient';

async function main() {
  const anya = await prisma.requester.findUnique({
    where: { email: 'anya@example.com' },
  });
  const categories = await prisma.category.findMany();
  
  if (anya && categories.length > 0) {
    const newTickets = Array.from({ length: 7 }).map((_, i) => ({
      title: `Extra ticket for pagination testing ${i + 1}`,
      description: `Description for extra ticket ${i + 1}`,
      status: i % 2 === 0 ? TicketStatus.OPEN : TicketStatus.IN_PROGRESS,
      priority: i % 3 === 0 ? Priority.HIGH : Priority.LOW,
      requesterId: anya.id,
      categoryId: categories[i % categories.length].id,
    }));
    
    await prisma.ticket.createMany({
      data: newTickets,
    });
    console.log('Seeded 7 extra tickets for Anya');
  }
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
