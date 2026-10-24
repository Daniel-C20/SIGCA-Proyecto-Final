import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { loadConfig } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!email || !password) throw new HttpError(400, 'Ingresa el correo y la contraseña.');

  const user = await User.findOne({ email }).select('+passwordHash');
  const validPassword = user && await bcrypt.compare(password, user.passwordHash);
  if (!user || !validPassword) throw new HttpError(401, 'Correo o contraseña incorrectos.');
  if (!user.isActive) throw new HttpError(403, 'La cuenta está inactiva.');

  const config = loadConfig();
  const token = jwt.sign({ sub: user.id }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
  return res.json({ token, user: user.toJSON() });
}

export function currentUser(req, res) {
  return res.json({ user: req.user.toJSON() });
}
