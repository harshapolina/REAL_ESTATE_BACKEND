import User from './models/User.js';
import Project from './models/Project.js';
import Budget from './models/Budget.js';
import Material from './models/Material.js';
import DailyTracking from './models/DailyTracking.js';
import InventoryLog from './models/InventoryLog.js';
import Procurement from './models/Procurement.js';
import Alert from './models/Alert.js';

async function syncMaterialsBaselineToBudget(projectId) {
  const mats = await Material.find({ projectId });
  const totalMatsPlannedCost = mats.reduce((sum, m) => sum + (m.planned * m.unitRate), 0);
  
  const budgetObj = await Budget.findOne({ projectId });
  if (budgetObj) {
    const matCat = budgetObj.categories.find(c => c.category === 'Materials');
    if (matCat) {
      matCat.allocated = totalMatsPlannedCost;
    }
    budgetObj.allocatedBudget = budgetObj.categories.reduce((sum, c) => sum + Number(c.allocated), 0);
    budgetObj.unallocatedBudget = budgetObj.totalBudget - budgetObj.allocatedBudget;
    await budgetObj.save();
  }
}

export const mockDb = {
  // Users
  getUsers: async () => {
    return await User.find();
  },
  getUserByEmail: async (email) => {
    return await User.findOne({ email });
  },
  
  // Projects
  getProjects: async (user) => {
    if (!user) return [];
    if (user.role === 'Platform Owner') {
      return await Project.find();
    }
    
    const myCompanyId = user.companyId || user.id;

    if (user.role === 'Super Admin') {
      return await Project.find({
        $or: [
          { companyId: myCompanyId },
          { ownerId: user.id }
        ]
      });
    } else if (user.role === 'Manager') {
      return await Project.find({
        $and: [
          { $or: [ { companyId: myCompanyId }, { ownerId: myCompanyId } ] },
          {
            $or: [
              { managerId: user.id },
              { id: { $in: user.assignedProjects || [] } }
            ]
          }
        ]
      });
    } else { // Site Manager or Employee
      return await Project.find({
        $and: [
          { $or: [ { companyId: myCompanyId }, { ownerId: myCompanyId } ] },
          { id: { $in: user.assignedProjects || [] } }
        ]
      });
    }
  },
  getProjectById: async (id) => {
    return await Project.findOne({ id });
  },
  createProject: async (proj, user) => {
    const newProj = new Project({
      id: `p-${Date.now()}`,
      ownerId: user.id, // Map project ownership to the creating Client
      companyId: user.companyId || user.id, // Stamp project with company ID
      phases: [],
      plannedMaterials: [],
      usedBudget: 0,
      progress: 0,
      status: "Planning",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
      ...proj
    });
    await newProj.save();
    
    // Setup initial empty budget & materials structure
    const budget = new Budget({
      projectId: newProj.id,
      totalBudget: newProj.budget,
      allocatedBudget: 0,
      unallocatedBudget: newProj.budget,
      budgetHealth: "Healthy",
      categories: [
        { category: "Materials", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Labour", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Equipment", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Transport", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Approvals & Fees", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Safety", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Subcontractors", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Contingency", allocated: 0, spent: 0, percentage: 0, health: "Good" },
        { category: "Other Expenses", allocated: 0, spent: 0, percentage: 0, health: "Good" }
      ],
      progressHistory: [
        { date: "1 May", planned: 0, actual: 0 }
      ]
    });
    await budget.save();

    await Material.insertMany([
      { id: "m-c", projectId: newProj.id, name: "Cement (53 Grade)", unit: "Bags", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 450, plannedCost: 0, actualCost: 0 },
      { id: "m-s", projectId: newProj.id, name: "Steel (TMT Bars)", unit: "Tons", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 65000, plannedCost: 0, actualCost: 0 },
      { id: "m-sd", projectId: newProj.id, name: "Sand", unit: "Loads", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 8000, plannedCost: 0, actualCost: 0 }
    ]);

    const alert = new Alert({
      id: `a-${Date.now()}`,
      projectId: newProj.id,
      title: "Project Initialized",
      desc: "Define plans and baselines to get started.",
      type: "Info",
      date: new Date().toISOString().split('T')[0]
    });
    await alert.save();

    return newProj;
  },
  updateProject: async (id, updates) => {
    const proj = await Project.findOne({ id });
    if (proj) {
      Object.assign(proj, updates);
      await proj.save();
      // Keep budget sync
      const budget = await Budget.findOne({ projectId: id });
      if (budget) {
        budget.totalBudget = Number(updates.budget || budget.totalBudget);
        budget.unallocatedBudget = budget.totalBudget - budget.allocatedBudget;
        await budget.save();
      }
      return proj;
    }
    return null;
  },
  addProjectPhase: async (projectId, phase) => {
    const proj = await Project.findOne({ id: projectId });
    if (proj) {
      const newPhase = {
        id: `ph-${Date.now()}`,
        status: 'Upcoming',
        budget: 0,
        targetArea: '-',
        duration: '-',
        ...phase
      };
      proj.phases.push(newPhase);
      await proj.save();
      return newPhase;
    }
    return null;
  },
  updateProjectPhase: async (projectId, phaseId, updates) => {
    const proj = await Project.findOne({ id: projectId });
    if (proj && proj.phases) {
      const phase = proj.phases.find(ph => ph.id === phaseId);
      if (phase) {
        Object.assign(phase, updates);
        await proj.save();
        return phase;
      }
    }
    return null;
  },
  deleteProjectPhase: async (projectId, phaseId) => {
    const proj = await Project.findOne({ id: projectId });
    if (proj && proj.phases) {
      const idx = proj.phases.findIndex(ph => ph.id === phaseId);
      if (idx !== -1) {
        const deleted = proj.phases[idx];
        proj.phases.splice(idx, 1);
        await proj.save();
        return deleted;
      }
    }
    return null;
  },

  // Budgets
  getBudget: async (projectId) => {
    await syncMaterialsBaselineToBudget(projectId);
    return await Budget.findOne({ projectId });
  },
  updateBudgetCategories: async (projectId, categories) => {
    const budget = await Budget.findOne({ projectId });
    if (budget) {
      budget.categories = categories;
      const allocated = categories.reduce((sum, c) => sum + Number(c.allocated), 0);
      budget.allocatedBudget = allocated;
      budget.unallocatedBudget = budget.totalBudget - allocated;
      await budget.save();
      return budget;
    }
    return null;
  },

  // Materials
  getMaterials: async (projectId) => {
    return await Material.find({ projectId });
  },
  updateMaterial: async (projectId, materialId, updates) => {
    const mat = await Material.findOne({ projectId, id: materialId });
    if (mat) {
      Object.keys(updates).forEach(key => {
        mat.set(key, updates[key]);
      });
      mat.remaining = mat.purchased - mat.used;
      mat.actualCost = mat.purchased * mat.unitRate;
      mat.plannedCost = mat.planned * mat.unitRate;

      const threshold = mat.get('lowStockThreshold') || 200;
      if (mat.remaining < threshold && mat.remaining > 0) {
        mat.status = "Low Stock";
      } else if (mat.remaining === 0) {
        mat.status = "To Order";
      } else {
        mat.status = "Optimal";
      }
      
      await mat.save();
      await syncMaterialsBaselineToBudget(projectId);
      return mat;
    }
    return null;
  },
  addMaterial: async (projectId, mat) => {
    const newMat = new Material({
      id: `m-${Date.now()}`,
      projectId,
      planned: 0,
      purchased: 0,
      used: 0,
      remaining: 0,
      status: "To Order",
      actualCost: 0,
      ...mat
    });
    newMat.plannedCost = newMat.planned * newMat.unitRate;
    await newMat.save();
    
    await syncMaterialsBaselineToBudget(projectId);
    return newMat;
  },
  deleteMaterial: async (projectId, materialId) => {
    const deleted = await Material.findOneAndDelete({ projectId, id: materialId });
    if (deleted) {
      await syncMaterialsBaselineToBudget(projectId);
    }
    return deleted;
  },

  // Daily Tracking
  getDailyTracking: async (projectId) => {
    return await DailyTracking.find({ projectId }).sort({ createdAt: -1 });
  },
  createDailyEntry: async (projectId, entry) => {
    const newEntry = new DailyTracking({
      id: `dt-${Date.now()}`,
      projectId,
      date: new Date().toISOString().split('T')[0],
      todayCost: 0,
      materialsUsed: 0,
      workProgress: 0,
      labourPresent: 0,
      workingHours: 8,
      tasks: [],
      materialUsageToday: [],
      areaWiseUsage: [],
      expensesBreakdown: [],
      attendance: { present: 0, absent: 0 },
      equipment: { active: 0, idle: 0 },
      issues: [],
      ...entry
    });
    await newEntry.save();
    
    // INTERLINK SYNC: Auto-update project budget used based on this daily cost
    const proj = await Project.findOne({ id: projectId });
    if (proj) {
      proj.usedBudget += Number(newEntry.todayCost);
      await proj.save();
      
      const budgetObj = await Budget.findOne({ projectId });
      if (budgetObj) {
        // Add to progress history
        budgetObj.progressHistory.push({
          date: newEntry.date.split('-').slice(1).reverse().join(' '),
          planned: budgetObj.progressHistory[budgetObj.progressHistory.length - 1]?.planned || proj.budget,
          actual: proj.usedBudget
        });

        // INTERLINK SYNC: Distribute daily expense categories into Budget spent categories
        if (newEntry.expensesBreakdown) {
          newEntry.expensesBreakdown.forEach(exp => {
            const cat = budgetObj.categories.find(c => 
              c.category.toLowerCase() === exp.name.toLowerCase() ||
              (exp.name === 'Other Expenses' && c.category === 'Other Expenses')
            );
            if (cat) {
              cat.spent += Number(exp.value);
            }
          });
        }
        await budgetObj.save();
      }
    }

    // INTERLINK SYNC: Auto-consume inventory quantities
    if (newEntry.materialUsageToday) {
      for (const usage of newEntry.materialUsageToday) {
        const mat = await Material.findOne({ 
          projectId, 
          name: new RegExp(usage.material.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') 
        });
        if (mat) {
          mat.used += Number(usage.used);
          mat.remaining = mat.purchased - mat.used;
          
          // Check stock threshold alerts
          const threshold = mat.get('lowStockThreshold') || 200;
          if (mat.remaining < threshold && mat.remaining > 0) {
            mat.status = "Low Stock";
          } else if (mat.remaining <= 0) {
            mat.status = "To Order";
          }
          await mat.save();
          
          // Log to Inventory Logs
          await InventoryLog.create({
            id: `il-${Date.now()}-${Math.random()}`,
            projectId,
            date: newEntry.date,
            material: mat.name,
            type: "Stock Out",
            quantity: usage.used,
            unit: mat.unit,
            remarks: `Daily tracking usage for ${newEntry.date}`
          });
        }
      }
    }

    return newEntry;
  },

  // Inventory
  getInventoryLogs: async (projectId) => {
    return await InventoryLog.find({ projectId }).sort({ createdAt: -1 });
  },
  addInventoryLog: async (projectId, log) => {
    const newLog = new InventoryLog({
      id: `il-${Date.now()}`,
      projectId,
      date: new Date().toISOString().split('T')[0],
      ...log
    });
    await newLog.save();

    // INTERLINK SYNC: Update material warehouse balances
    const mat = await Material.findOne({
      projectId,
      name: new RegExp('^' + log.material.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i')
    });
    if (mat) {
      const qty = Number(log.quantity);
      if (log.type === "Stock In") {
        mat.purchased += qty;
      } else if (log.type === "Stock Out") {
        mat.used += qty;
      }
      mat.remaining = mat.purchased - mat.used;
      mat.actualCost = mat.purchased * mat.unitRate;
      await mat.save();
      
      // Low Stock triggers
      const threshold = mat.get('lowStockThreshold') || 200;
      if (mat.remaining < threshold && mat.remaining > 0) {
        mat.status = "Low Stock";
        await Alert.create({
          id: `a-${Date.now()}`,
          projectId,
          title: `${mat.name} stock is low`,
          desc: `Current stock: ${mat.remaining} ${mat.unit}. Reorder soon!`,
          type: "Warning",
          date: newLog.date
        });
      } else if (mat.remaining <= 0) {
        mat.status = "To Order";
      } else {
        mat.status = "Optimal";
      }
      await mat.save();
    }
    return newLog;
  },

  // Procurement
  getProcurement: async (projectId) => {
    return await Procurement.find({ projectId }).sort({ createdAt: -1 });
  },
  createProcurementRequest: async (projectId, request) => {
    const today = new Date().toISOString().split('T')[0];
    const newReq = new Procurement({
      id: `pr-${Date.now()}`,
      projectId,
      status: "requested",
      cost: request.quantity * (request.unitRate || 400),
      date: today,
      ...request,
      history: [
        {
          status: "requested",
          date: today,
          user: request.requestedBy || "Arjun Reddy"
        }
      ]
    });
    await newReq.save();
    return newReq;
  },
  updateProcurementStatus: async (projectId, id, status) => {
    const req = await Procurement.findOne({ projectId, id });
    if (req) {
      req.status = status;
      req.date = new Date().toISOString().split('T')[0];

      let user = "Sanjay Kumar";
      if (status === "approved") {
        user = "Arjun Reddy";
      } else if (status === "delivered") {
        user = "Meera Nair";
      }
      
      if (!req.history) req.history = [];
      req.history.push({
        status,
        date: req.date,
        user
      });
      
      // INTERLINK SYNC: If status is updated to delivered, log to inventory logs and stock in the material automatically
      if (status === "delivered") {
        await InventoryLog.create({
          id: `il-proc-${Date.now()}`,
          projectId,
          date: req.date,
          material: req.material,
          type: "Stock In",
          quantity: req.quantity,
          unit: req.unit,
          remarks: `Received via PO (Vendor: ${req.vendor})`
        });
        
        const mat = await Material.findOne({
          projectId,
          name: new RegExp(req.material.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
        });
        if (mat) {
          mat.purchased += Number(req.quantity);
          mat.remaining = mat.purchased - mat.used;
          mat.actualCost = mat.purchased * mat.unitRate;
          const threshold = mat.get('lowStockThreshold') || 200;
          mat.status = mat.remaining < threshold ? "Low Stock" : "Optimal";
          await mat.save();
        }
      }
      
      await req.save();
      return req;
    }
    return null;
  },

  // Alerts
  getAlerts: async (projectId) => {
    return await Alert.find({ projectId }).sort({ createdAt: -1 });
  }
};
