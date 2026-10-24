import mongoose from 'mongoose';
import { Service } from '../models/Service.js';
import { HttpError } from '../utils/httpError.js';

const writableFields = ['name', 'description', 'durationMinutes', 'price', 'imageUrl', 'isActive'];

function validateServiceInput(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new HttpError(400, 'El cuerpo de la solicitud debe ser un objeto JSON.');
  const input = Object.fromEntries(writableFields.filter((key) => Object.hasOwn(body, key)).map((key) => [key, body[key]]));
  const unknown = Object.keys(body).filter((key) => !writableFields.includes(key));
  if (unknown.length) throw new HttpError(400, `Campo(s) no permitido(s): ${unknown.join(', ')}.`);
  if (!partial && ['name', 'description', 'durationMinutes', 'price'].some((key) => !Object.hasOwn(input, key))) {
    throw new HttpError(400, 'Nombre, descripción, duración y precio son obligatorios.');
  }
  if (partial && Object.keys(input).length === 0) throw new HttpError(400, 'Envía al menos un campo para actualizar.');
  if (Object.hasOwn(input, 'name') && (typeof input.name !== 'string' || input.name.trim().length < 2 || input.name.trim().length > 100)) {
    throw new HttpError(400, 'El nombre debe tener entre 2 y 100 caracteres.');
  }
  if (Object.hasOwn(input, 'description') && (typeof input.description !== 'string' || input.description.trim().length < 10 || input.description.trim().length > 1200)) {
    throw new HttpError(400, 'La descripción debe tener entre 10 y 1200 caracteres.');
  }
  if (Object.hasOwn(input, 'durationMinutes') && (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0 || input.durationMinutes > 1440)) {
    throw new HttpError(400, 'La duración debe ser un número entero de 1 a 1440 minutos.');
  }
  if (Object.hasOwn(input, 'price') && (typeof input.price !== 'number' || !Number.isFinite(input.price) || input.price < 0 || input.price > 100000)) {
    throw new HttpError(400, 'El precio debe ser un número entre Q0 y Q100,000.');
  }
  if (Object.hasOwn(input, 'imageUrl') && (typeof input.imageUrl !== 'string' || input.imageUrl.length > 500)) {
    throw new HttpError(400, 'La URL de imagen debe ser texto de hasta 500 caracteres.');
  }
  if (Object.hasOwn(input, 'imageUrl') && input.imageUrl && !(input.imageUrl.startsWith('/') && !input.imageUrl.startsWith('//'))) {
    try {
      if (!['http:', 'https:'].includes(new URL(input.imageUrl).protocol)) throw new Error();
    } catch {
      throw new HttpError(400, 'La imagen debe ser una ruta local o una URL HTTP/HTTPS.');
    }
  }
  if (Object.hasOwn(input, 'isActive') && typeof input.isActive !== 'boolean') {
    throw new HttpError(400, 'El estado debe ser verdadero o falso.');
  }
  return input;
}

function validId(id) {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, 'El identificador del servicio no es válido.');
}

export async function listServices(req, res) {
  const requestedState = req.query.estado;
  const states = { ACTIVO: true, INACTIVO: false };
  if (requestedState && !Object.hasOwn(states, requestedState) && requestedState !== 'TODOS') {
    throw new HttpError(400, 'El filtro estado debe ser ACTIVO, INACTIVO o TODOS.');
  }
  if (!req.user && requestedState && requestedState !== 'ACTIVO') {
    throw new HttpError(401, 'Inicia sesión para consultar servicios inactivos.');
  }
  if (req.user && requestedState && requestedState !== 'ACTIVO' && req.user.role !== 'ADMINISTRADOR') {
    throw new HttpError(403, 'Solo un administrador puede consultar servicios inactivos.');
  }
  const filter = {};
  if (!requestedState || requestedState === 'ACTIVO') filter.isActive = true;
  else if (requestedState === 'INACTIVO') filter.isActive = false;
  const items = await Service.find(filter).sort({ name: 1 });
  return res.json({ items });
}

export async function getService(req, res) {
  validId(req.params.id);
  const service = await Service.findById(req.params.id);
  if (!service) throw new HttpError(404, 'Servicio no encontrado.');
  if (!service.isActive && req.user?.role !== 'ADMINISTRADOR') throw new HttpError(404, 'Servicio no encontrado.');
  return res.json({ service });
}

export async function createService(req, res) {
  const service = await Service.create(validateServiceInput(req.body));
  return res.status(201).json({ service });
}

export async function updateService(req, res) {
  validId(req.params.id);
  const input = validateServiceInput(req.body, { partial: true });
  const service = await Service.findByIdAndUpdate(req.params.id, input, { new: true, runValidators: true });
  if (!service) throw new HttpError(404, 'Servicio no encontrado.');
  return res.json({ service });
}

export async function setServiceStatus(req, res) {
  validId(req.params.id);
  if (typeof req.body?.isActive !== 'boolean' || Object.keys(req.body).length !== 1) {
    throw new HttpError(400, 'Envía únicamente el campo isActive con valor verdadero o falso.');
  }
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true, runValidators: true });
  if (!service) throw new HttpError(404, 'Servicio no encontrado.');
  return res.json({ service });
}
