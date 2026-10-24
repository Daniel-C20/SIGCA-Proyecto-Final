import test from 'node:test';
import assert from 'node:assert/strict';
import { healthCheck } from '../src/app.js';

test('GET /api/health informa que MongoDB no está conectado', () => {
  let status;
  let body;
  const response = {
    status(code) { status = code; return this; },
    json(value) { body = value; return this; },
  };
  healthCheck({}, response);
  assert.equal(status, 503);
  assert.deepEqual(body, { status: 'degraded', database: 'disconnected' });
});
