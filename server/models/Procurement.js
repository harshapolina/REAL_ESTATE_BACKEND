import mongoose from 'mongoose';

const ProcurementHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: String, required: true },
  user: { type: String }
});

const ProcurementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  status: { type: String, required: true },
  requestedBy: { type: String },
  vendor: { type: String },
  cost: { type: Number, default: 0 },
  date: { type: String },
  history: [ProcurementHistorySchema]
}, { timestamps: true });

ProcurementSchema.index({ id: 1, projectId: 1 }, { unique: true });

export default mongoose.model('Procurement', ProcurementSchema);
