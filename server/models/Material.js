import mongoose from 'mongoose';

const MaterialSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  name: { type: String, required: true },
  unit: { type: String, required: true },
  planned: { type: Number, default: 0 },
  purchased: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  status: { type: String, default: 'To Order' },
  unitRate: { type: Number, required: true },
  plannedCost: { type: Number, default: 0 },
  actualCost: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 200 }
}, { timestamps: true, strict: false });

MaterialSchema.index({ id: 1, projectId: 1 }, { unique: true });

export default mongoose.model('Material', MaterialSchema);
