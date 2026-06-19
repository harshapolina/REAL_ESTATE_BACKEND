import mongoose from 'mongoose';

const InventoryLogSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  date: { type: String, required: true },
  material: { type: String, required: true },
  type: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  remarks: { type: String }
}, { timestamps: true });

InventoryLogSchema.index({ id: 1, projectId: 1 }, { unique: true });

export default mongoose.model('InventoryLog', InventoryLogSchema);
