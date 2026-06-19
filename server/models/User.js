import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Platform Owner', 'Super Admin', 'Manager', 'Site Manager', 'Employee'],
    default: 'Employee' 
  },
  companyId: { type: String }, // Maps to Super Admin (Company root)
  parentId: { type: String },  // Maps to creator's ID for hierarchy rendering
  isActive: { type: Boolean, default: true },
  assignedProjects: [{ type: String }],
  avatar: { type: String }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);

