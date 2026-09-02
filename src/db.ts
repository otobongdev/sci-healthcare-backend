import { PrismaClient } from '@prisma/client';

import { env } from './env.js';

export const prisma = new PrismaClient({
  log: env.LOG_LEVEL === 'debug' ? ['query', 'warn', 'error'] : ['warn', 'error'],
});

export async function disconnect(): Promise<void> {
  await prisma.$disconnect();
}
