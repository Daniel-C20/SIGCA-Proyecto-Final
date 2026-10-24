import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'El nombre es obligatorio.'], unique: true, trim: true, minlength: 2, maxlength: 100 },
  description: { type: String, required: [true, 'La descripción es obligatoria.'], trim: true, minlength: 10, maxlength: 1200 },
  durationMinutes: { type: Number, required: [true, 'La duración es obligatoria.'], min: [1, 'La duración debe ser positiva.'], max: 1440, validate: Number.isInteger },
  price: { type: Number, required: [true, 'El precio es obligatorio.'], min: [0, 'El precio no puede ser negativo.'], max: 100000 },
  imageUrl: { type: String, trim: true, maxlength: 500, default: '', validate: { validator: (value) => {
    if (!value || (value.startsWith('/') && !value.startsWith('//'))) return true;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
  }, message: 'La imagen debe ser una ruta local o una URL HTTP/HTTPS.' } },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
