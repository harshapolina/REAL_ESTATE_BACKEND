import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  allocated: { type: Number, default: 0 },
  spent: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  health: { type: String, default: 'Good' }
});

const ProgressHistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  planned: { type: Number, default: 0 },
  actual: { type: Number, default: 0 }
});

const BudgetSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  totalBudget: { type: Number, required: true },
  allocatedBudget: { type: Number, default: 0 },
  unallocatedBudget: { type: Number, default: 0 },
  budgetHealth: { type: String, default: 'Healthy' },
  categories: [CategorySchema],
  progressHistory: [ProgressHistorySchema]
}, { timestamps: true });

export default mongoose.model('Budget', BudgetSchema);
