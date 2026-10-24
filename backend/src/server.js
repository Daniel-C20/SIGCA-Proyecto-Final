import app from './app.js';
import { connectDatabase } from './config/database.js';
import { loadConfig } from './config/env.js';

try {
  const config = loadConfig();
  await connectDatabase(config.mongoUri);
  const server = app.listen(config.port, () => {
    console.log(`SIGCA API disponible en http://localhost:${config.port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => server.close(async () => {
      const mongoose = await import('mongoose');
      await mongoose.default.disconnect();
      process.exit(0);
    }));
  }
} catch (error) {
  console.error(`No se pudo iniciar la API: ${error.message}`);
  process.exitCode = 1;
}
