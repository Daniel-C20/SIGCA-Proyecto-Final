import test from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../src/models/User.js';
import { Patient } from '../src/models/Patient.js';
import { Service } from '../src/models/Service.js';
import { Appointment } from '../src/models/Appointment.js';

test('el modelo Usuario omite el hash en su representación JSON', () => {
  const user = new User({ name: 'Demo', email: 'demo@example.test', passwordHash: 'hash-seguro', role: 'ADMINISTRADOR' });
  const result = user.toJSON();
  assert.equal(result.passwordHash, undefined);
  assert.equal(result.email, 'demo@example.test');
});

test('el modelo Servicio acepta valores válidos y rechaza precio negativo y duración fraccionaria', async () => {
  const valid = new Service({ name: 'Psicología clínica', description: 'Acompañamiento y bienestar emocional.', durationMinutes: 50, price: 250 });
  await assert.doesNotReject(valid.validate());

  const invalid = new Service({ name: 'Sesión', description: 'Descripción de ejemplo válida.', durationMinutes: 45.5, price: -1, imageUrl: 'javascript:alert(1)' });
  await assert.rejects(invalid.validate(), (error) => {
    assert.ok(error.errors.price);
    assert.ok(error.errors.durationMinutes);
    assert.ok(error.errors.imageUrl);
    return true;
  });
});

test('la edad del paciente se calcula desde la fecha de nacimiento', () => {
  const today = new Date();
  const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const patient = new Patient({ identifier: 'TEST-1', firstName: 'Paciente', lastName: 'Demo', birthDate });
  assert.equal(patient.age, 18);
  assert.equal(patient.toJSON().age, 18);
});

test('la cita preparada valida que la hora final sea posterior a la inicial', async () => {
  const appointment = new Appointment({
    patient: '507f1f77bcf86cd799439011', service: '507f1f77bcf86cd799439012', professional: '507f1f77bcf86cd799439013',
    date: new Date(), startTime: '11:00', endTime: '10:00', priceCaptured: 250,
  });
  await assert.rejects(appointment.validate(), (error) => Boolean(error.errors.endTime));
});
