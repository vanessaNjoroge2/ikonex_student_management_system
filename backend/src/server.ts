import app from './app';
import { env } from './config/env';
import { prisma } from './config/db';

async function startServer() {
  try {
    // Verify database connection
    console.log('Connecting to PostgreSQL database via Prisma...');
    await prisma.$connect();
    console.log('Database connection established successfully.');

    const port = env.port;
    app.listen(port, () => {
      console.log(`🚀 Ikonex Student Management API is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
