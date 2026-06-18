import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Mock Data Seed
const initialSeed = {
  users: [
    {
      id: "u-1",
      name: "Arjun Reddy",
      email: "arjun@buildtrack.com",
      password: "$2a$10$abcdefghijklmnopqrstuvMockPasswordHash123", // matches secret/password
      role: "Administrator",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: "u-2",
      name: "Sanjay Kumar",
      email: "sanjay@buildtrack.com",
      password: "$2a$10$abcdefghijklmnopqrstuvMockPasswordHash123",
      role: "Project Manager",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
    },
    {
      id: "u-3",
      name: "Meera Nair",
      email: "meera@buildtrack.com",
      password: "$2a$10$abcdefghijklmnopqrstuvMockPasswordHash123",
      role: "Site Engineer",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    }
  ],
  projects: [
    {
      id: "p-1",
      name: "Green Valley Residency",
      location: "Hyderabad, Telangana",
      area: 100000,
      duration: "6 Months",
      startDate: "2024-05-01",
      endDate: "2024-10-31",
      budget: 50000000,
      usedBudget: 34200000,
      progress: 72,
      status: "On Track",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
      phases: [
        { id: "ph-1", name: "Foundation & Columns", targetArea: "20,000 SFT", duration: "01 May - 30 Jun 2024", budget: 12000000, status: "Active" },
        { id: "ph-2", name: "Slab & Structure", targetArea: "40,000 SFT", duration: "01 Jul - 31 Aug 2024", budget: 22000000, status: "Upcoming" },
        { id: "ph-3", name: "Finishing Work", targetArea: "40,000 SFT", duration: "01 Sep - 31 Oct 2024", budget: 16000000, status: "Upcoming" }
      ],
      plannedMaterials: [
        { name: "Cement (53 Grade)", unit: "Bags", totalPlanned: 10000, ph1: 2000, ph2: 4000, ph3: 4000, unitRate: 450, totalCost: 4500000 },
        { name: "Steel (TMT Bars)", unit: "Tons", totalPlanned: 150, ph1: 30, ph2: 70, ph3: 50, unitRate: 65000, totalCost: 9750000 },
        { name: "Sand", unit: "Loads", totalPlanned: 800, ph1: 200, ph2: 400, ph3: 200, unitRate: 8000, totalCost: 6400000 },
        { name: "Bricks", unit: "Nos", totalPlanned: 120000, ph1: 30000, ph2: 60000, ph3: 30000, unitRate: 15, totalCost: 1800000 },
        { name: "Aggregate (20mm)", unit: "Loads", totalPlanned: 400, ph1: 100, ph2: 200, ph3: 100, unitRate: 10000, totalCost: 4000000 },
        { name: "Aggregate (10mm)", unit: "Loads", totalPlanned: 300, ph1: 80, ph2: 120, ph3: 100, unitRate: 10000, totalCost: 3000000 },
        { name: "Concrete (RMC)", unit: "Cum", totalPlanned: 500, ph1: 100, ph2: 250, ph3: 150, unitRate: 2500, totalCost: 1250000 },
        { name: "Shuttering Plywood", unit: "Sheets", totalPlanned: 1200, ph1: 240, ph2: 600, ph3: 360, unitRate: 500, totalCost: 600000 },
        { name: "Reinforcement Wire", unit: "Kg", totalPlanned: 1000, ph1: 200, ph2: 500, ph3: 300, unitRate: 90, totalCost: 90000 },
        { name: "Electrical & Fittings", unit: "Lump Sum", totalPlanned: 1, ph1: 0, ph2: 0, ph3: 1, unitRate: 1500000, totalCost: 1500000 },
        { name: "Plumbing Pipes & Fixtures", unit: "Lump Sum", totalPlanned: 1, ph1: 0, ph2: 0, ph3: 1, unitRate: 1800000, totalCost: 1800000 },
        { name: "Paint & Finishes", unit: "Liters", totalPlanned: 5000, ph1: 0, ph2: 0, ph3: 5000, unitRate: 250, totalCost: 1250000 },
        { name: "Tiles & Marble", unit: "SFT", totalPlanned: 40000, ph1: 0, ph2: 0, ph3: 40000, unitRate: 120, totalCost: 4800000 }
      ]
    },
    {
      id: "p-2",
      name: "Skyline Towers",
      location: "Bangalore, Karnataka",
      area: 120000,
      duration: "5 Months",
      startDate: "2024-04-15",
      endDate: "2024-09-15",
      budget: 45000000,
      usedBudget: 20250000,
      progress: 45,
      status: "At Risk",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80",
      phases: [
        { id: "ph-4", name: "Foundation & Columns", targetArea: "30,000 SFT", duration: "15 Apr - 31 May 2024", budget: 10000000, status: "Completed" },
        { id: "ph-5", name: "Slab & Structure", targetArea: "60,000 SFT", duration: "01 Jun - 31 Jul 2024", budget: 20000000, status: "Active" },
        { id: "ph-6", name: "Finishing Work", targetArea: "30,000 SFT", duration: "01 Aug - 15 Sep 2024", budget: 15000000, status: "Upcoming" }
      ],
      plannedMaterials: [
        { name: "Cement (53 Grade)", unit: "Bags", totalPlanned: 12000, ph1: 3000, ph2: 6000, ph3: 3000, unitRate: 430, totalCost: 5160000 }
      ]
    },
    {
      id: "p-3",
      name: "Maple Heights",
      location: "Pune, Maharashtra",
      area: 80000,
      duration: "5 Months",
      startDate: "2024-03-10",
      endDate: "2024-08-10",
      budget: 37500000,
      usedBudget: 33000000,
      progress: 88,
      status: "On Track",
      coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80",
      phases: [],
      plannedMaterials: []
    },
    {
      id: "p-4",
      name: "Sunrise Apartments",
      location: "Hyderabad, Telangana",
      area: 150000,
      duration: "6 Months",
      startDate: "2024-02-05",
      endDate: "2024-08-05",
      budget: 60000000,
      usedBudget: 18000000,
      progress: 30,
      status: "Delayed",
      coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&auto=format&fit=crop&q=80",
      phases: [],
      plannedMaterials: []
    },
    {
      id: "p-5",
      name: "Elite Villas",
      location: "Chennai, Tamil Nadu",
      area: 50000,
      duration: "5 Months",
      startDate: "2024-05-01",
      endDate: "2024-09-30",
      budget: 25000000,
      usedBudget: 15000000,
      progress: 60,
      status: "On Track",
      coverImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80",
      phases: [],
      plannedMaterials: []
    },
    {
      id: "p-6",
      name: "Lake View Enclave",
      location: "Hyderabad, Telangana",
      area: 90000,
      duration: "6 Months",
      startDate: "2024-07-01",
      endDate: "2024-12-31",
      budget: 42000000,
      usedBudget: 4200000,
      progress: 10,
      status: "Planning",
      coverImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&auto=format&fit=crop&q=80",
      phases: [],
      plannedMaterials: []
    }
  ],
  budgets: {
    "p-1": {
      totalBudget: 50000000,
      allocatedBudget: 45000000,
      unallocatedBudget: 5000000,
      budgetHealth: "Healthy",
      categories: [
        { category: "Materials", allocated: 22000000, spent: 18200000, percentage: 44, health: "Good" },
        { category: "Labour", allocated: 10000000, spent: 9000000, percentage: 20, health: "Good" },
        { category: "Equipment", allocated: 5000000, spent: 3000000, percentage: 10, health: "Good" },
        { category: "Transport", allocated: 2000000, spent: 1500000, percentage: 4, health: "Good" },
        { category: "Approvals & Fees", allocated: 1500000, spent: 1200000, percentage: 3, health: "Warning" },
        { category: "Safety", allocated: 1000000, spent: 800000, percentage: 2, health: "Good" },
        { category: "Subcontractors", allocated: 5000000, spent: 4500000, percentage: 10, health: "Good" },
        { category: "Contingency", allocated: 2000000, spent: 500000, percentage: 4, health: "Good" },
        { category: "Other Expenses", allocated: 1500000, spent: 1000000, percentage: 3, health: "Good" }
      ],
      progressHistory: [
        { date: "1 May", planned: 5000000, actual: 4800000 },
        { date: "15 May", planned: 12000000, actual: 11500000 },
        { date: "1 Jun", planned: 20000000, actual: 19800000 },
        { date: "15 Jun", planned: 30000000, actual: 29500000 },
        { date: "1 Jul", planned: 40000000, actual: 34200000 }
      ]
    }
  },
  materials: {
    "p-1": [
      { id: "m-1", name: "Cement (53 Grade)", unit: "Bags", planned: 10000, purchased: 8500, used: 7200, remaining: 1300, status: "Low Stock", unitRate: 450, plannedCost: 4500000, actualCost: 3825000 },
      { id: "m-2", name: "Steel (TMT Bars)", unit: "Tons", planned: 150, purchased: 120, used: 98, remaining: 22, status: "Optimal", unitRate: 65000, plannedCost: 9750000, actualCost: 7800000 },
      { id: "m-3", name: "Sand", unit: "Loads", planned: 800, purchased: 700, used: 650, remaining: 50, status: "Low Stock", unitRate: 8000, plannedCost: 6400000, actualCost: 5600000 },
      { id: "m-4", name: "Bricks", unit: "Nos", planned: 120000, purchased: 100000, used: 92000, remaining: 8000, status: "Optimal", unitRate: 15, plannedCost: 1800000, actualCost: 1500000 },
      { id: "m-5", name: "Aggregate (20mm)", unit: "Loads", planned: 400, purchased: 350, used: 310, remaining: 40, status: "Optimal", unitRate: 10000, plannedCost: 4000000, actualCost: 3500000 },
      { id: "m-6", name: "Electrical & Fittings", unit: "Lump Sum", planned: 1, purchased: 1, used: 0, remaining: 1, status: "Optimal", unitRate: 1500000, plannedCost: 1500000, actualCost: 1500000 },
      { id: "m-7", name: "Plumbing Pipes & Fixtures", unit: "Lump Sum", planned: 1, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 1800000, plannedCost: 1800000, actualCost: 0 },
      { id: "m-8", name: "Paint & Finishes", unit: "Liters", planned: 5000, purchased: 1000, used: 200, remaining: 800, status: "Optimal", unitRate: 250, plannedCost: 1250000, actualCost: 250000 },
      { id: "m-9", name: "Tiles & Marble", unit: "SFT", planned: 40000, purchased: 10000, used: 1000, remaining: 9000, status: "Optimal", unitRate: 120, plannedCost: 4800000, actualCost: 1200000 }
    ]
  },
  dailyTracking: {
    "p-1": [
      {
        id: "dt-1",
        date: "2024-06-12",
        todayCost: 78000,
        materialsUsed: 156, // units
        workProgress: 2.3,
        labourPresent: 42,
        workingHours: 8.5,
        tasks: [
          { name: "Foundation Work", area: "Block A", status: "Completed" },
          { name: "Columns Work", area: "Block B", status: "In Progress" },
          { name: "Slab Work", area: "Block A", status: "Not Started" },
          { name: "Roof Preparation", area: "Block C", status: "Started" }
        ],
        materialUsageToday: [
          { material: "Cement", used: 120, unit: "Bags", cost: 48000 },
          { material: "Steel", used: 4.2, unit: "Tons", cost: 22000 },
          { material: "Sand", used: 12, unit: "Loads", cost: 6000 },
          { material: "Bricks", used: 2500, unit: "Nos", cost: 2000 }
        ],
        areaWiseUsage: [
          { area: "Block A", quantity: 50, material: "Cement Used" },
          { area: "Block B", quantity: 40, material: "Cement Used" },
          { area: "Block C (Roof)", quantity: 30, material: "Cement Used" },
          { area: "Site Office", quantity: 10, material: "Cement Used" }
        ],
        expensesBreakdown: [
          { name: "Materials", value: 35000, percentage: 44.9 },
          { name: "Labour", value: 20000, percentage: 25.6 },
          { name: "Equipment", value: 15000, percentage: 19.2 },
          { name: "Other Expenses", value: 8000, percentage: 10.3 }
        ],
        attendance: { present: 42, absent: 2 },
        equipment: { active: 5, idle: 2 },
        issues: [
          { id: "i-1", title: "Concrete mixer breakdown", severity: "Medium", status: "Resolved" },
          { id: "i-2", title: "Late delivery of sand load", severity: "Low", status: "Open" }
        ]
      }
    ]
  },
  inventoryLogs: {
    "p-1": [
      { id: "il-1", date: "2024-06-12", material: "Cement (53 Grade)", type: "Stock Out", quantity: 120, unit: "Bags", remarks: "Issued to Block A Columns" },
      { id: "il-2", date: "2024-06-11", material: "Cement (53 Grade)", type: "Stock In", quantity: 500, unit: "Bags", remarks: "Supplier: Ultratech Cement Ltd" },
      { id: "il-3", date: "2024-06-10", material: "Steel (TMT Bars)", type: "Stock Out", quantity: 4.2, unit: "Tons", remarks: "Issued to Block B Columns" },
      { id: "il-4", date: "2024-06-08", material: "Sand", type: "Stock In", quantity: 20, unit: "Loads", remarks: "Supplier: Local Quarry Supply" }
    ]
  },
  procurement: {
    "p-1": [
      { id: "pr-1", material: "Cement (53 Grade)", quantity: 500, unit: "Bags", status: "po_created", requestedBy: "Sanjay Kumar", vendor: "UltraTech Cements", cost: 225000, date: "2024-06-15" },
      { id: "pr-2", material: "Steel (TMT Bars)", quantity: 15, unit: "Tons", status: "approved", requestedBy: "Sanjay Kumar", vendor: "Tata Tiscon", cost: 975000, date: "2024-06-16" },
      { id: "pr-3", material: "Plumbing Pipes", quantity: 100, unit: "Nos", status: "requested", requestedBy: "Meera Nair", vendor: "Supreme Pipes", cost: 85000, date: "2024-06-17" },
      { id: "pr-4", material: "Sand", quantity: 10, unit: "Loads", status: "delivered", requestedBy: "Meera Nair", vendor: "Local Quarries", cost: 80000, date: "2024-06-11" }
    ]
  },
  alerts: {
    "p-1": [
      { id: "a-1", title: "Cement stock will finish in 6 days", desc: "Reorder 500 Bags to avoid delay", type: "Warning", date: "2024-06-17" },
      { id: "a-2", title: "Steel usage exceeded plan by 8%", desc: "Extra cost: ₹2,40,00,000", type: "Critical", date: "2024-06-16" },
      { id: "a-3", title: "Project is 5 days behind schedule", desc: "Delay may impact overall timeline", type: "Info", date: "2024-06-15" },
      { id: "a-4", title: "Great! You saved ₹1,20,000", desc: "This month on material costs", type: "Success", date: "2024-06-14" }
    ]
  }
};

// Initialize file
let db = initialSeed;

function recalculateActualCosts(projectId) {
  const mats = db.materials[projectId] || [];
  mats.forEach(mat => {
    mat.remaining = Math.max(0, mat.purchased - mat.used);
    mat.actualCost = mat.purchased * mat.unitRate;
    mat.plannedCost = mat.planned * mat.unitRate;
  });

  const budgetObj = db.budgets[projectId];
  if (budgetObj) {
    const totalActualMatsCost = mats.reduce((sum, m) => sum + m.actualCost, 0);
    const matCat = budgetObj.categories.find(c => c.category === 'Materials');
    if (matCat) {
      matCat.spent = totalActualMatsCost;
    }
    budgetObj.allocatedBudget = budgetObj.categories.reduce((sum, c) => sum + Number(c.allocated), 0);
    budgetObj.unallocatedBudget = budgetObj.totalBudget - budgetObj.allocatedBudget;
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      db = JSON.parse(raw);
      
      // Self-heal records on load to maintain mathematical consistency
      for (const projectId in db.materials) {
        recalculateActualCosts(projectId);
      }

      // Self-heal: Sync phase-wise planned quantities from projects[idx].plannedMaterials to materials[projectId]
      if (db.projects && db.materials) {
        db.projects.forEach(project => {
          const pMats = project.plannedMaterials || [];
          const mats = db.materials[project.id] || [];
          mats.forEach(mat => {
            const pMat = pMats.find(pm => pm.name.toLowerCase() === mat.name.toLowerCase());
            if (pMat) {
              if (project.phases && project.phases.length > 0) {
                project.phases.forEach((phase, index) => {
                  const phaseKey = phase.id;
                  const fallbackKey = `ph${index + 1}`;
                  if (mat[phaseKey] === undefined) {
                    if (pMat[phaseKey] !== undefined) {
                      mat[phaseKey] = pMat[phaseKey];
                    } else if (pMat[fallbackKey] !== undefined) {
                      mat[phaseKey] = pMat[fallbackKey];
                    } else {
                      mat[phaseKey] = 0;
                    }
                  }
                });
              }
            }
          });
        });
      }

      // Self-heal: Sync history for existing procurement items
      if (db.procurement) {
        for (const projectId in db.procurement) {
          const list = db.procurement[projectId] || [];
          list.forEach(req => {
            if (!req.history || req.history.length === 0) {
              req.history = [
                {
                  status: "requested",
                  date: req.date || "2024-06-11",
                  user: req.requestedBy || "Sanjay Kumar"
                }
              ];
              // If status is not requested, append the current status as well
              if (req.status !== 'requested') {
                req.history.push({
                  status: req.status,
                  date: req.date || "2024-06-12",
                  user: req.status === 'delivered' ? "Meera Nair" : (req.requestedBy || "Sanjay Kumar")
                });
              }
            }
          });
        }
      }
      
      saveDb();
    } else {
      saveDb();
    }
  } catch (error) {
    console.error("Error reading DB file:", error);
    db = initialSeed;
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (error) {
    console.error("Error writing DB file:", error);
  }
}

// Function to auto-sync Materials Center planned cost sums into the Budget allocation for "Materials"
function syncMaterialsBaselineToBudget(projectId) {
  const mats = db.materials[projectId] || [];
  const totalMatsPlannedCost = mats.reduce((sum, m) => sum + (m.planned * m.unitRate), 0);
  
  const budgetObj = db.budgets[projectId];
  if (budgetObj) {
    const matCat = budgetObj.categories.find(c => c.category === 'Materials');
    if (matCat) {
      matCat.allocated = totalMatsPlannedCost;
    }
    // Recalculate allocated and unallocated totals
    budgetObj.allocatedBudget = budgetObj.categories.reduce((sum, c) => sum + Number(c.allocated), 0);
    budgetObj.unallocatedBudget = budgetObj.totalBudget - budgetObj.allocatedBudget;
  }
}

// Load data immediately
loadDb();

export const mockDb = {
  // Users
  getUsers: () => { loadDb(); return db.users; },
  getUserByEmail: (email) => { loadDb(); return db.users.find(u => u.email === email); },
  
  // Projects
  getProjects: () => { loadDb(); return db.projects; },
  getProjectById: (id) => { loadDb(); return db.projects.find(p => p.id === id); },
  createProject: (proj) => {
    loadDb();
    const newProj = {
      id: `p-${Date.now()}`,
      phases: [],
      plannedMaterials: [],
      usedBudget: 0,
      progress: 0,
      status: "Planning",
      coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600",
      ...proj
    };
    db.projects.push(newProj);
    
    // Setup initial empty budget & materials structure
    db.budgets[newProj.id] = {
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
    };
    db.materials[newProj.id] = [
      { id: "m-c", name: "Cement (53 Grade)", unit: "Bags", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 450, plannedCost: 0, actualCost: 0 },
      { id: "m-s", name: "Steel (TMT Bars)", unit: "Tons", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 65000, plannedCost: 0, actualCost: 0 },
      { id: "m-sd", name: "Sand", unit: "Loads", planned: 0, purchased: 0, used: 0, remaining: 0, status: "To Order", unitRate: 8000, plannedCost: 0, actualCost: 0 }
    ];
    db.dailyTracking[newProj.id] = [];
    db.inventoryLogs[newProj.id] = [];
    db.procurement[newProj.id] = [];
    db.alerts[newProj.id] = [
      { id: `a-${Date.now()}`, title: "Project Initialized", desc: "Define plans and baselines to get started.", type: "Info", date: new Date().toISOString().split('T')[0] }
    ];
    saveDb();
    return newProj;
  },
  updateProject: (id, updates) => {
    loadDb();
    const idx = db.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.projects[idx] = { ...db.projects[idx], ...updates };
      // Keep budget sync
      if (db.budgets[id]) {
        db.budgets[id].totalBudget = Number(updates.budget || db.budgets[id].totalBudget);
        db.budgets[id].unallocatedBudget = db.budgets[id].totalBudget - db.budgets[id].allocatedBudget;
      }
      saveDb();
      return db.projects[idx];
    }
    return null;
  },
  addProjectPhase: (projectId, phase) => {
    loadDb();
    const proj = db.projects.find(p => p.id === projectId);
    if (proj) {
      if (!proj.phases) proj.phases = [];
      const newPhase = {
        id: `ph-${Date.now()}`,
        status: 'Upcoming',
        budget: 0,
        targetArea: '-',
        duration: '-',
        ...phase
      };
      proj.phases.push(newPhase);
      saveDb();
      return newPhase;
    }
    return null;
  },
  updateProjectPhase: (projectId, phaseId, updates) => {
    loadDb();
    const proj = db.projects.find(p => p.id === projectId);
    if (proj && proj.phases) {
      const idx = proj.phases.findIndex(ph => ph.id === phaseId);
      if (idx !== -1) {
        proj.phases[idx] = { ...proj.phases[idx], ...updates };
        saveDb();
        return proj.phases[idx];
      }
    }
    return null;
  },
  deleteProjectPhase: (projectId, phaseId) => {
    loadDb();
    const proj = db.projects.find(p => p.id === projectId);
    if (proj && proj.phases) {
      const idx = proj.phases.findIndex(ph => ph.id === phaseId);
      if (idx !== -1) {
        const deleted = proj.phases.splice(idx, 1);
        saveDb();
        return deleted[0];
      }
    }
    return null;
  },

  // Budgets
  getBudget: (projectId) => {
    loadDb();
    // Verify sync before returning
    syncMaterialsBaselineToBudget(projectId);
    return db.budgets[projectId] || null;
  },
  updateBudgetCategories: (projectId, categories) => {
    loadDb();
    if (db.budgets[projectId]) {
      db.budgets[projectId].categories = categories;
      const allocated = categories.reduce((sum, c) => sum + Number(c.allocated), 0);
      db.budgets[projectId].allocatedBudget = allocated;
      db.budgets[projectId].unallocatedBudget = db.budgets[projectId].totalBudget - allocated;
      saveDb();
      return db.budgets[projectId];
    }
    return null;
  },

  // Materials
  getMaterials: (projectId) => {
    loadDb();
    return db.materials[projectId] || [];
  },
  updateMaterial: (projectId, materialId, updates) => {
    loadDb();
    const list = db.materials[projectId];
    if (list) {
      const idx = list.findIndex(m => m.id === materialId);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        list[idx].remaining = list[idx].purchased - list[idx].used;
        list[idx].actualCost = list[idx].purchased * list[idx].unitRate;
        list[idx].plannedCost = list[idx].planned * list[idx].unitRate;
        if (list[idx].remaining < 200 && list[idx].remaining > 0) {
          list[idx].status = "Low Stock";
        } else if (list[idx].remaining === 0) {
          list[idx].status = "To Order";
        } else {
          list[idx].status = "Optimal";
        }
        
        // INTERLINK SYNC: Propagate material cost changes directly to budget category
        syncMaterialsBaselineToBudget(projectId);
        
        saveDb();
        return list[idx];
      }
    }
    return null;
  },
  addMaterial: (projectId, mat) => {
    loadDb();
    if (!db.materials[projectId]) db.materials[projectId] = [];
    const newMat = {
      id: `m-${Date.now()}`,
      planned: 0,
      purchased: 0,
      used: 0,
      remaining: 0,
      status: "To Order",
      actualCost: 0,
      ...mat
    };
    newMat.plannedCost = newMat.planned * newMat.unitRate;
    db.materials[projectId].push(newMat);
    
    // INTERLINK SYNC: Propagate new material planned costs directly to budget category
    syncMaterialsBaselineToBudget(projectId);
    
    saveDb();
    return newMat;
  },
  deleteMaterial: (projectId, materialId) => {
    loadDb();
    const list = db.materials[projectId];
    if (list) {
      const idx = list.findIndex(m => m.id === materialId);
      if (idx !== -1) {
        const deleted = list.splice(idx, 1);
        // INTERLINK SYNC: Propagate deleted material planned costs directly to budget category
        syncMaterialsBaselineToBudget(projectId);
        saveDb();
        return deleted[0];
      }
    }
    return null;
  },

  // Daily Tracking
  getDailyTracking: (projectId) => {
    loadDb();
    return db.dailyTracking[projectId] || [];
  },
  createDailyEntry: (projectId, entry) => {
    loadDb();
    if (!db.dailyTracking[projectId]) db.dailyTracking[projectId] = [];
    const newEntry = {
      id: `dt-${Date.now()}`,
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
    };
    db.dailyTracking[projectId].unshift(newEntry);
    
    // INTERLINK SYNC: Auto-update project budget used based on this daily cost
    const proj = db.projects.find(p => p.id === projectId);
    if (proj) {
      proj.usedBudget += Number(newEntry.todayCost);
      
      const budgetObj = db.budgets[projectId];
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
      }
    }

    // INTERLINK SYNC: Auto-consume inventory quantities
    if (newEntry.materialUsageToday && db.materials[projectId]) {
      newEntry.materialUsageToday.forEach(usage => {
        const mat = db.materials[projectId].find(m => m.name.toLowerCase().includes(usage.material.toLowerCase()));
        if (mat) {
          mat.used += Number(usage.used);
          mat.remaining = mat.purchased - mat.used;
          
          // Check stock threshold alerts
          if (mat.remaining < 200 && mat.remaining > 0) {
            mat.status = "Low Stock";
          } else if (mat.remaining <= 0) {
            mat.status = "To Order";
          }
          
          // Log to Inventory Logs
          if (!db.inventoryLogs[projectId]) db.inventoryLogs[projectId] = [];
          db.inventoryLogs[projectId].unshift({
            id: `il-${Date.now()}-${Math.random()}`,
            date: newEntry.date,
            material: mat.name,
            type: "Stock Out",
            quantity: usage.used,
            unit: mat.unit,
            remarks: `Daily tracking usage for ${newEntry.date}`
          });
        }
      });
    }

    saveDb();
    return newEntry;
  },

  // Inventory
  getInventoryLogs: (projectId) => {
    loadDb();
    return db.inventoryLogs[projectId] || [];
  },
  addInventoryLog: (projectId, log) => {
    loadDb();
    if (!db.inventoryLogs[projectId]) db.inventoryLogs[projectId] = [];
    const newLog = {
      id: `il-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...log
    };
    db.inventoryLogs[projectId].unshift(newLog);

    // INTERLINK SYNC: Update material warehouse balances
    if (db.materials[projectId]) {
      const mat = db.materials[projectId].find(m => m.name.toLowerCase() === log.material.toLowerCase());
      if (mat) {
        const qty = Number(log.quantity);
        if (log.type === "Stock In") {
          mat.purchased += qty;
        } else if (log.type === "Stock Out") {
          mat.used += qty;
        }
        mat.remaining = mat.purchased - mat.used;
        mat.actualCost = mat.purchased * mat.unitRate;
        
        // Low Stock triggers
        if (mat.remaining < 200 && mat.remaining > 0) {
          mat.status = "Low Stock";
          db.alerts[projectId].unshift({
            id: `a-${Date.now()}`,
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
      }
    }
    saveDb();
    return newLog;
  },

  // Procurement
  getProcurement: (projectId) => {
    loadDb();
    return db.procurement[projectId] || [];
  },
  createProcurementRequest: (projectId, request) => {
    loadDb();
    if (!db.procurement[projectId]) db.procurement[projectId] = [];
    const today = new Date().toISOString().split('T')[0];
    const newReq = {
      id: `pr-${Date.now()}`,
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
    };
    db.procurement[projectId].unshift(newReq);
    saveDb();
    return newReq;
  },
  updateProcurementStatus: (projectId, id, status) => {
    loadDb();
    const list = db.procurement[projectId];
    if (list) {
      const req = list.find(r => r.id === id);
      if (req) {
        req.status = status;
        req.date = new Date().toISOString().split('T')[0];

        // Append to history transition log
        if (!req.history) {
          req.history = [];
        }
        let user = "Sanjay Kumar";
        if (status === "approved") {
          user = "Arjun Reddy";
        } else if (status === "delivered") {
          user = "Meera Nair";
        }
        req.history.push({
          status,
          date: req.date,
          user
        });
        
        // INTERLINK SYNC: If status is updated to delivered, log to inventory logs and stock in the material automatically
        if (status === "delivered") {
          if (!db.inventoryLogs[projectId]) db.inventoryLogs[projectId] = [];
          db.inventoryLogs[projectId].unshift({
            id: `il-proc-${Date.now()}`,
            date: req.date,
            material: req.material,
            type: "Stock In",
            quantity: req.quantity,
            unit: req.unit,
            remarks: `Received via PO (Vendor: ${req.vendor})`
          });
          
          if (db.materials[projectId]) {
            const mat = db.materials[projectId].find(m => m.name.toLowerCase().includes(req.material.toLowerCase()));
            if (mat) {
              mat.purchased += Number(req.quantity);
              mat.remaining = mat.purchased - mat.used;
              mat.actualCost = mat.purchased * mat.unitRate;
              mat.status = mat.remaining < 200 ? "Low Stock" : "Optimal";
            }
          }
        }
        
        saveDb();
        return req;
      }
    }
    return null;
  },

  // Alerts
  getAlerts: (projectId) => {
    loadDb();
    return db.alerts[projectId] || [];
  }
};
