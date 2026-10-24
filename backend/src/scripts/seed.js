import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { loadConfig } from '../config/env.js';
import { Service } from '../models/Service.js';
import { User } from '../models/User.js';

const config = loadConfig();
const services = [
  { name: 'Psicología clínica', description: 'Acompañamiento psicológico individual centrado en el bienestar emocional y el desarrollo personal.', durationMinutes: 50, price: 250, imageUrl: '/images/service-psychology.svg', isActive: true },
  { name: 'Terapia de lenguaje', description: 'Evaluación e intervención para fortalecer la comunicación y el desarrollo del lenguaje.', durationMinutes: 45, price: 225, imageUrl: '/images/service-language.svg', isActive: true },
  { name: 'Estimulación auditiva verbal', description: 'Acompañamiento especializado para desarrollar habilidades auditivas y comunicativas.', durationMinutes: 45, price: 275, imageUrl: '/images/service-auditory.svg', isActive: true },
  { name: 'Orientación familiar', description: 'Espacio de orientación para acompañar el bienestar y los procesos de cada familia.', durationMinutes: 60, price: 300, imageUrl: '/images/service-family.svg', isActive: true },
];

try {
  await connectDatabase(config.mongoUri);
  const email = (process.env.SEED_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || '';
  const name = (process.env.SEED_ADMIN_NAME || 'Administración SIGCA').trim();
  if (!email || !password || password.length < 12) {
    throw new Error('Define SEED_ADMIN_EMAIL y una SEED_ADMIN_PASSWORD de al menos 12 caracteres en backend/.env.');
  }
  const passwordHash = await bcrypt.hash(password, 12);
  await User.updateOne(
    { email },
    { $setOnInsert: { name, email, passwordHash, role: 'ADMINISTRADOR', isActive: true } },
    { upsert: true, runValidators: true },
  );

  for (const service of services) {
    await Service.updateOne({ name: service.name }, { $setOnInsert: service }, { upsert: true, runValidators: true });
  }
  console.log(`Datos de demostración listos. Administrador: ${email}. Servicios de ejemplo: ${services.length}.`);
} catch (error) {
  console.error(`No se pudieron crear los datos de demostración: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
