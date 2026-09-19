import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const server = app.listen(env.PORT, () => {
  console.log(`🌿 Ayur Essence Backend Server running on http://localhost:${env.PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🩺 Health check available at: http://localhost:${env.PORT}/api/health`);
});

const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n[${signal}] Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default server;
