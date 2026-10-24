import 'dotenv/config';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
  return value;
}

export function loadConfig() {
  const jwtSecret = required('JWT_SECRET');
  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 4000),
    mongoUri: required('MONGODB_URI'),
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
