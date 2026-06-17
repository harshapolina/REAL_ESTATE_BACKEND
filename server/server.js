import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { mockDb } from './mockDb.js';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'buildtrack_jwt_super_secret_key';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "Access token required" });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Route: Auth Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = mockDb.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Simulated password match for testing (accepts any password matching email user in demo)
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// Route: Get current user profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = mockDb.getUsers().find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// Route: Get all projects
app.get('/api/projects', (req, res) => {
  res.json(mockDb.getProjects());
});

// Route: Create project
app.post('/api/projects', (req, res) => {
  const { name, location, area, duration, startDate, endDate, budget } = req.body;
  if (!name || !location || !budget) {
    return res.status(400).json({ message: "Name, Location and Budget are required" });
  }
  const project = mockDb.createProject(req.body);
  res.status(201).json(project);
});

// Route: Get project by id
app.get('/api/projects/:id', (req, res) => {
  const project = mockDb.getProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});

// Route: Add a project phase
app.post('/api/projects/:id/phases', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Phase name is required" });
  }
  const phase = mockDb.addProjectPhase(req.params.id, req.body);
  if (!phase) return res.status(404).json({ message: "Project not found" });
  res.status(201).json(phase);
});

// Route: Get project budget
app.get('/api/projects/:id/budget', (req, res) => {
  const budget = mockDb.getBudget(req.params.id);
  if (!budget) return res.status(404).json({ message: "Budget details not found" });
  res.json(budget);
});

// Route: Update budget categories
app.put('/api/projects/:id/budget', (req, res) => {
  const { categories } = req.body;
  if (!categories || !Array.isArray(categories)) {
    return res.status(400).json({ message: "Categories array is required" });
  }
  const budget = mockDb.updateBudgetCategories(req.params.id, categories);
  if (!budget) return res.status(404).json({ message: "Project or Budget not found" });
  res.json(budget);
});

// Route: Get materials list for a project
app.get('/api/projects/:id/materials', (req, res) => {
  res.json(mockDb.getMaterials(req.params.id));
});

// Route: Add a material
app.post('/api/projects/:id/materials', (req, res) => {
  const { name, unit, planned, unitRate } = req.body;
  if (!name || !unit || planned === undefined || !unitRate) {
    return res.status(400).json({ message: "Missing required material fields" });
  }
  const mat = mockDb.addMaterial(req.params.id, req.body);
  res.status(201).json(mat);
});

// Route: Update material stock/cost
app.put('/api/projects/:id/materials/:materialId', (req, res) => {
  const mat = mockDb.updateMaterial(req.params.id, req.params.materialId, req.body);
  if (!mat) return res.status(404).json({ message: "Material not found" });
  res.json(mat);
});

// Route: Delete a material
app.delete('/api/projects/:id/materials/:materialId', (req, res) => {
  const deleted = mockDb.deleteMaterial(req.params.id, req.params.materialId);
  if (!deleted) return res.status(404).json({ message: "Material not found" });
  res.json({ message: "Material deleted successfully", deleted });
});

// Route: Get daily tracking logs
app.get('/api/projects/:id/daily-tracking', (req, res) => {
  res.json(mockDb.getDailyTracking(req.params.id));
});

// Route: Create daily tracking log entry
app.post('/api/projects/:id/daily-tracking', (req, res) => {
  const entry = mockDb.createDailyEntry(req.params.id, req.body);
  res.status(201).json(entry);
});

// Route: Get inventory logs
app.get('/api/projects/:id/inventory', (req, res) => {
  res.json(mockDb.getInventoryLogs(req.params.id));
});

// Route: Record inventory transaction (Stock In/Out)
app.post('/api/projects/:id/inventory', (req, res) => {
  const { material, type, quantity, unit, remarks } = req.body;
  if (!material || !type || !quantity || !unit) {
    return res.status(400).json({ message: "Missing inventory details" });
  }
  const log = mockDb.addInventoryLog(req.params.id, req.body);
  res.status(201).json(log);
});

// Route: Get procurement dashboard
app.get('/api/projects/:id/procurement', (req, res) => {
  res.json(mockDb.getProcurement(req.params.id));
});

// Route: Create purchase request
app.post('/api/projects/:id/procurement', (req, res) => {
  const { material, quantity, unit, vendor } = req.body;
  if (!material || !quantity || !unit) {
    return res.status(400).json({ message: "Missing procurement item details" });
  }
  const request = mockDb.createProcurementRequest(req.params.id, req.body);
  res.status(201).json(request);
});

// Route: Update procurement workflow status
app.put('/api/projects/:id/procurement/:requestId', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status is required" });
  const reqItem = mockDb.updateProcurementStatus(req.params.id, req.params.requestId, status);
  if (!reqItem) return res.status(404).json({ message: "Procurement request not found" });
  res.json(reqItem);
});

// Route: Get project alerts
app.get('/api/projects/:id/alerts', (req, res) => {
  res.json(mockDb.getAlerts(req.params.id));
});

// Serve the API
app.listen(PORT, () => {
  console.log(`BuildTrack Server running on http://localhost:${PORT}`);
});
