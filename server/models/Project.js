import mongoose from 'mongoose';

const PhaseSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  targetArea: { type: String },
  duration: { type: String },
  budget: { type: Number },
  status: { type: String }
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  ownerId: { type: String, required: true }, // Client (User) ID who owns the project
  companyId: { type: String }, // Company ID that owns the project
  managerId: { type: String }, // Manager user ID assigned to update tracking
  name: { type: String, required: true },
  location: { type: String, required: true },
  area: { type: Number },
  duration: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  budget: { type: Number, required: true },
  usedBudget: { type: Number, default: 0 },
  progress: { type: Number, default: 0 },
  status: { type: String, default: 'Planning' },
  coverImage: { type: String },
  phases: [PhaseSchema],
  plannedMaterials: [mongoose.Schema.Types.Mixed]
}, { timestamps: true });

export default mongoose.model('Project', ProjectSchema);
