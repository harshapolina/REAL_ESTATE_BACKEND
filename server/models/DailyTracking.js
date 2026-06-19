import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String },
  status: { type: String }
});

const MaterialUsageTodaySchema = new mongoose.Schema({
  material: { type: String, required: true },
  used: { type: Number, default: 0 },
  unit: { type: String },
  cost: { type: Number, default: 0 }
});

const AreaWiseUsageSchema = new mongoose.Schema({
  area: { type: String },
  quantity: { type: Number },
  material: { type: String }
});

const ExpenseBreakdownSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 }
});

const IssueSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String },
  severity: { type: String },
  status: { type: String }
});

const DailyTrackingSchema = new mongoose.Schema({
  id: { type: String, required: true },
  projectId: { type: String, required: true },
  date: { type: String, required: true },
  todayCost: { type: Number, default: 0 },
  materialsUsed: { type: Number, default: 0 },
  workProgress: { type: Number, default: 0 },
  labourPresent: { type: Number, default: 0 },
  workingHours: { type: Number, default: 8.5 },
  tasks: [TaskSchema],
  materialUsageToday: [MaterialUsageTodaySchema],
  areaWiseUsage: [AreaWiseUsageSchema],
  expensesBreakdown: [ExpenseBreakdownSchema],
  attendance: {
    present: { type: Number, default: 0 },
    absent: { type: Number, default: 0 }
  },
  equipment: {
    active: { type: Number, default: 0 },
    idle: { type: Number, default: 0 }
  },
  issues: [IssueSchema]
}, { timestamps: true });

DailyTrackingSchema.index({ id: 1, projectId: 1 }, { unique: true });

export default mongoose.model('DailyTracking', DailyTrackingSchema);
