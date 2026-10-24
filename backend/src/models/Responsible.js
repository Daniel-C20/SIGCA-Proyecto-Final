import mongoose from 'mongoose';

const responsibleSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
  photoUrl: { type: String, trim: true, default: '' },
  firstName: { type: String, required: true, trim: true, maxlength: 80 },
  lastName: { type: String, required: true, trim: true, maxlength: 100 },
  relationship: { type: String, required: true, trim: true, maxlength: 60 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, lowercase: true, trim: true, maxlength: 254, default: '', validate: { validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), message: 'El correo electrónico no tiene un formato válido.' } },
  address: { type: String, trim: true, maxlength: 300, default: '' },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
}, { timestamps: true });

export const Responsible = mongoose.models.Responsible || mongoose.model('Responsible', responsibleSchema);
