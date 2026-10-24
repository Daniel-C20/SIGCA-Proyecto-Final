import jwt from 'jsonwebtoken';
import { loadConfig } from '../config/env.js';
import { User } from '../models/User.js';
import { HttpError } from '../utils/httpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

async function authenticateRequest(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Debes iniciar sesión.');

  let payload;
  try {
    payload = jwt.verify(token, loadConfig().jwtSecret);
  } catch {
    throw new HttpError(401, 'La sesión no es válida o ha vencido.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new HttpError(401, 'La cuenta no está disponible.');
  req.user = user;
}

export const requireAuth = asyncHandler(async (req, res, next) => {
  await authenticateRequest(req);
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  if (!req.get('authorization')) return next();
  await authenticateRequest(req);
  next();
});

export function allowRoles(...roles) {
  return function authorize(req, res, next) {
    if (!req.user) return next(new HttpError(401, 'Debes iniciar sesión.'));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, 'No tienes permiso para realizar esta acción.'));
    next();
  };
}
