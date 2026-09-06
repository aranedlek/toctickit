import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Use the direct TCP connection string from prisma dev
// Remove problematic timeout params; set reasonable pool limits
const connectionString = process.env.DATABASE_DIRECT_URL ||
  'postgres://postgres:postgres@localhost:51214/template1?sslmode=disable';

const adapter = new PrismaPg({
  connectionString,
  max: 5,
});
export const prisma = new PrismaClient({ adapter });
