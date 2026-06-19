import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  title: { type: String, required: true },
  desc: { type: String },
  type: { type: String, required: true },
  date: { type: String }
}, { timestamps: true });

AlertSchema.index({ id: 1, projectId: 1 }, { unique: true });

export default mongoose.model('Alert', AlertSchema);
