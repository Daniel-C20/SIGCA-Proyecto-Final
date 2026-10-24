import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  photoUrl: { type: String, trim: true, default: '' },
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 100 },
  birthDate: { type: Date, required: true },
  sex: { type: String, enum: ['FEMENINO', 'MASCULINO', 'OTRO', 'NO_ESPECIFICADO'], default: 'NO_ESPECIFICADO' },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  address: { type: String, trim: true, maxlength: 300, default: '' },
  processStartDate: { type: Date, default: Date.now },
  administrativeNotes: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' },
  responsiblePeople: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Responsible' }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

patientSchema.virtual('age').get(function getAge() {
  if (!this.birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - this.birthDate.getFullYear();
  const beforeBirthday = today.getMonth() < this.birthDate.getMonth()
    || (today.getMonth() === this.birthDate.getMonth() && today.getDate() < this.birthDate.getDate());
  if (beforeBirthday) age -= 1;
  return age;
});

export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);
