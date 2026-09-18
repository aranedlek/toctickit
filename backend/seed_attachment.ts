import { prisma } from './src/prismaClient';

async function main() {
  const anya = await prisma.requester.findUnique({
    where: { email: 'anya@example.com' },
  });
  
  if (anya) {
    const ticket = await prisma.ticket.findFirst({
      where: { requesterId: anya.id }
    });
    
    if (ticket) {
      await prisma.attachment.create({
        data: {
          ticketId: ticket.id,
          filename: 'error_screenshot_login.png',
          storagePath: 'uploads/error_screenshot_login.png',
          mimeType: 'image/png',
          sizeBytes: 254000,
        }
      });
      console.log(`Seeded attachment for Ticket #${ticket.id}`);
    }
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
