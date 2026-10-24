import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['ADMINISTRADOR', 'RECEPCIONISTA', 'PROFESIONAL'], required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true, toJSON: { transform: hideSecrets }, toObject: { transform: hideSecrets } });

function hideSecrets(_doc, value) {
  delete value.passwordHash;
  delete value.__v;
  return value;
}

export const User = mongoose.models.User || mongoose.model('User', userSchema);
