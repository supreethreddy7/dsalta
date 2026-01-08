import 'reflect-metadata';
import dotenv from 'dotenv';

import { createApp } from './app';
import { prisma } from './prisma';

dotenv.config();

const port = Number(process.env.PORT ?? 3000);

const app = createApp();

const server = app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/docs`);
});

async function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Shutting down...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
