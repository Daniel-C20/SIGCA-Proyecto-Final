import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Service } from '../src/models/Service.js';

const mongoUri = process.env.TEST_MONGODB_URI;

test('API de autenticación, roles y servicios con MongoDB real', { skip: !mongoUri && 'Configura TEST_MONGODB_URI para ejecutar integración con MongoDB.' }, async () => {
  process.env.MONGODB_URI = mongoUri;
  process.env.JWT_SECRET ||= 'solo-para-pruebas-integracion-sigca-2026';
  process.env.JWT_EXPIRES_IN ||= '15m';

  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const adminEmail = `sigca-admin-${suffix}@example.test`;
  const receptionistEmail = `sigca-recepcion-${suffix}@example.test`;
  const prefix = `[TEST SIGCA ${suffix}]`;
  const password = 'SIGCA-Integration-Test-2026!';
  const passwordHash = await bcrypt.hash(password, 4);
  let server;
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    await User.create([
      { name: 'Admin de prueba', email: adminEmail, passwordHash, role: 'ADMINISTRADOR', isActive: true },
      { name: 'Recepción de prueba', email: receptionistEmail, passwordHash, role: 'RECEPCIONISTA', isActive: true },
    ]);
    server = app.listen(0, '127.0.0.1');
    await new Promise((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    const request = async (path, options = {}) => {
      const response = await fetch(`${base}${path}`, {
        ...options,
        headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
      });
      return { response, body: await response.json() };
    };

    const anonymousMe = await request('/api/auth/me');
    assert.equal(anonymousMe.response.status, 401);
    const anonymousCreate = await request('/api/servicios', { method: 'POST', body: JSON.stringify({}) });
    assert.equal(anonymousCreate.response.status, 401);

    const adminLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: adminEmail, password }) });
    assert.equal(adminLogin.response.status, 200);
    assert.ok(adminLogin.body.token);
    assert.equal(adminLogin.body.user.passwordHash, undefined);
    const adminToken = adminLogin.body.token;
    const me = await request('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.passwordHash, undefined);

    const receptionistLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: receptionistEmail, password }) });
    assert.equal(receptionistLogin.response.status, 200);
    const roleDenied = await request('/api/servicios', { method: 'POST', headers: { Authorization: `Bearer ${receptionistLogin.body.token}` }, body: JSON.stringify({}) });
    assert.equal(roleDenied.response.status, 403);

    const input = { name: `${prefix} Servicio`, description: 'Servicio de prueba para validar el catálogo API.', durationMinutes: 45, price: 125, imageUrl: '', isActive: true };
    const created = await request('/api/servicios', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify(input) });
    assert.equal(created.response.status, 201);
    const id = created.body.service._id;
    assert.equal(created.body.service.price, 125);

    const publicList = await request('/api/servicios');
    assert.equal(publicList.response.status, 200);
    assert.ok(publicList.body.items.some((item) => item._id === id));
    const invalidInput = await request(`/api/servicios/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ price: -1 }) });
    assert.equal(invalidInput.response.status, 400);

    const updated = await request(`/api/servicios/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ ...input, name: `${prefix} Actualizado`, price: 175 }) });
    assert.equal(updated.response.status, 200);
    assert.equal(updated.body.service.price, 175);
    const deactivated = await request(`/api/servicios/${id}/estado`, { method: 'PATCH', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ isActive: false }) });
    assert.equal(deactivated.response.status, 200);
    assert.equal(deactivated.body.service.isActive, false);
    const hidden = await request('/api/servicios');
    assert.equal(hidden.body.items.some((item) => item._id === id), false);
    const privateFilter = await request('/api/servicios?estado=INACTIVO', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.ok(privateFilter.body.items.some((item) => item._id === id));
    const receptionistPrivateFilter = await request('/api/servicios?estado=INACTIVO', { headers: { Authorization: `Bearer ${receptionistLogin.body.token}` } });
    assert.equal(receptionistPrivateFilter.response.status, 403);
    const receptionistDefaultList = await request('/api/servicios', { headers: { Authorization: `Bearer ${receptionistLogin.body.token}` } });
    assert.equal(receptionistDefaultList.body.items.some((item) => item._id === id), false);
    const receptionistInactiveService = await request(`/api/servicios/${id}`, { headers: { Authorization: `Bearer ${receptionistLogin.body.token}` } });
    assert.equal(receptionistInactiveService.response.status, 404);
    const adminOnlyRead = await request(`/api/servicios/${id}`, { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(adminOnlyRead.response.status, 200);

    const inactiveUser = await User.findOne({ email: adminEmail });
    inactiveUser.isActive = false;
    await inactiveUser.save();
    const rejectedInactive = await request('/api/auth/me', { headers: { Authorization: `Bearer ${adminToken}` } });
    assert.equal(rejectedInactive.response.status, 401);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    await Service.deleteMany({ name: new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) });
    await User.deleteMany({ email: { $in: [adminEmail, receptionistEmail] } });
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  }
});
