import mongoose from 'mongoose';

const professionalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  licenseNumber: { type: String, trim: true, maxlength: 60, default: '' },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  specialty: { type: String, trim: true, maxlength: 120, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Professional = mongoose.models.Professional || mongoose.model('Professional', professionalSchema);
