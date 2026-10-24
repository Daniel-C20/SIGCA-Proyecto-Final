import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  professional: { type: mongoose.Schema.Types.ObjectId, ref: 'Professional', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  priceCaptured: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'], default: 'PENDIENTE' },
  administrativeNotes: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: { createdAt: true, updatedAt: false } });

appointmentSchema.pre('validate', function validateTimeOrder() {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    this.invalidate('endTime', 'La hora de finalización debe ser posterior al inicio.');
  }
});

export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);
