import app from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 GETUP OS Agency Management Backend Server`);
  console.log(`📡 Base API URL: http://localhost:${env.PORT}/api`);
  console.log(`🛡️  Environment: ${env.NODE_ENV}`);
  console.log(`==================================================`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app };
export default app;
