import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { connectDB } from './db.js';
import { mockDb } from './mockDb.js';
import User from './models/User.js';
import Project from './models/Project.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'buildtrack_jwt_super_secret_key';

// Connect Database
connectDB();

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

// Admin Hierarchy Access Middleware (Platform Owner, Super Admin, Manager)
const requireHierarchyAdmin = (req, res, next) => {
  if (req.user && ['Platform Owner', 'Super Admin', 'Manager'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ message: "Access Denied: Administrative access required." });
};

// Project Access Control Middleware
const authorizeProjectAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const projectId = req.params.id;

    if (userRole === 'Platform Owner') {
      return next();
    }

    const project = await Project.findOne({ id: projectId });
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Super Admin must own the project
    if (userRole === 'Super Admin') {
      if (project.ownerId === userId) {
        return next();
      }
      return res.status(403).json({ message: "Access Denied: You do not own this project." });
    }

    const isAssignedManager = project.managerId === userId && userRole === 'Manager';
    const isAssignedUser = req.user.assignedProjects?.includes(projectId);

    // Site Manager & Employee are strictly limited to Daily Tracking
    if (userRole === 'Site Manager' || userRole === 'Employee') {
      if (!isAssignedUser) {
        return res.status(403).json({ message: "Access Denied: You are not assigned to this project." });
      }
      
      // Allow project details (metadata) read, daily tracking, and alerts read
      const isProjectDetails = req.path === `/api/projects/${projectId}` || req.path === `/projects/${projectId}` || req.path === `/${projectId}`;
      const allowedPaths = ['daily-tracking', 'alerts'];
      const isAllowed = allowedPaths.some(p => req.path.includes(p)) || isProjectDetails;
      if (!isAllowed) {
        return res.status(403).json({ message: "Access Denied: Site Managers and Employees are strictly limited to Daily Tracking." });
      }
    }

    if (isAssignedManager || isAssignedUser) {
      return next();
    }

    return res.status(403).json({ message: "Access Denied: You do not have permission for this project." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Route: Auth Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body; // email field holds email or username from UI
    if (!email || !password) {
      return res.status(400).json({ message: "Email/Username and password are required" });
    }

    const user = await User.findOne({
      $or: [
        { email: email },
        { username: email }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Your account is deactivated. Please contact the administrator." });
    }

    // Simulated password match for testing (in production, use bcrypt.compare)
    if (password !== user.password && user.password !== '$2a$10$abcdefghijklmnopqrstuvMockPasswordHash123') {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      role: user.role, 
      companyId: user.companyId || (user.role === 'Super Admin' ? user.id : null),
      parentId: user.parentId,
      assignedProjects: user.assignedProjects || [] 
    }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || (user.role === 'Super Admin' ? user.id : null),
        parentId: user.parentId,
        assignedProjects: user.assignedProjects || [],
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get current user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.user.id });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId || (user.role === 'Super Admin' ? user.id : null),
        parentId: user.parentId,
        assignedProjects: user.assignedProjects || [],
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// User Hierarchy Management Endpoints
// ==========================================
app.get('/api/admin/users', authenticateToken, requireHierarchyAdmin, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Platform Owner') {
      query = {}; // Platform Owner sees all users
    } else if (req.user.role === 'Super Admin') {
      // Super Admin sees users of their company (either companyId matches their ID or companyId is their ID)
      const myCompanyId = req.user.companyId || req.user.id;
      query = { companyId: myCompanyId };
    } else if (req.user.role === 'Manager') {
      // Manager sees users they directly created/report to them
      query = { parentId: req.user.id };
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
    const users = await User.find(query, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/admin/users', authenticateToken, requireHierarchyAdmin, async (req, res) => {
  try {
    const { username, name, email, password, role, assignedProjects } = req.body;
    if (!username || !name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate role selection based on creator's role
    const creatorRole = req.user.role;
    const targetRole = role || 'Employee';

    if (creatorRole === 'Super Admin') {
      if (!['Manager', 'Site Manager', 'Employee'].includes(targetRole)) {
        return res.status(403).json({ message: "Access Denied: Super Admin can only create Manager, Site Manager, or Employee accounts." });
      }
    } else if (creatorRole === 'Manager') {
      if (!['Site Manager', 'Employee'].includes(targetRole)) {
        return res.status(403).json({ message: "Access Denied: Manager can only create Site Manager or Employee accounts." });
      }
    }

    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const newUserId = `u-${Date.now()}`;
    
    // Determine companyId & parentId
    let companyId = null;
    let parentId = req.user.id;

    if (creatorRole === 'Platform Owner') {
      if (targetRole === 'Super Admin') {
        companyId = newUserId; // Super Admin starts a new company tenant
      } else {
        companyId = req.body.companyId || null;
      }
    } else if (creatorRole === 'Super Admin') {
      companyId = req.user.companyId || req.user.id;
    } else if (creatorRole === 'Manager') {
      companyId = req.user.companyId;
    }

    const newUser = new User({
      id: newUserId,
      username,
      name,
      email,
      password,
      role: targetRole,
      companyId,
      parentId,
      isActive: true,
      assignedProjects: assignedProjects || []
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/admin/users/:userId', authenticateToken, requireHierarchyAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate scope (can only edit users under their control)
    const creatorRole = req.user.role;
    if (creatorRole === 'Super Admin') {
      const myCompanyId = req.user.companyId || req.user.id;
      if (user.companyId !== myCompanyId) {
        return res.status(403).json({ message: "Access Denied: You can only edit users in your company." });
      }
    } else if (creatorRole === 'Manager') {
      if (user.parentId !== req.user.id) {
        return res.status(403).json({ message: "Access Denied: You can only edit users reporting to you." });
      }
    }

    const { name, email, role, isActive, assignedProjects, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    if (isActive !== undefined) user.isActive = isActive;
    if (assignedProjects) user.assignedProjects = assignedProjects;

    // Validate role modification
    if (role && role !== user.role) {
      if (creatorRole === 'Super Admin') {
        if (!['Manager', 'Site Manager', 'Employee'].includes(role)) {
          return res.status(400).json({ message: "Invalid role assigned by Super Admin." });
        }
      } else if (creatorRole === 'Manager') {
        if (!['Site Manager', 'Employee'].includes(role)) {
          return res.status(400).json({ message: "Invalid role assigned by Manager." });
        }
      }
      user.role = role;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireHierarchyAdmin, async (req, res) => {
  try {
    const user = await User.findOne({ id: req.params.userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Validate scope
    const creatorRole = req.user.role;
    if (creatorRole === 'Super Admin') {
      const myCompanyId = req.user.companyId || req.user.id;
      if (user.companyId !== myCompanyId) {
        return res.status(403).json({ message: "Access Denied: You can only delete users in your company." });
      }
    } else if (creatorRole === 'Manager') {
      if (user.parentId !== req.user.id) {
        return res.status(403).json({ message: "Access Denied: You can only delete users reporting to you." });
      }
    }

    await User.findOneAndDelete({ id: req.params.userId });
    res.json({ message: "User deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// ==========================================
// Project and Resource Endpoints
// ==========================================

// Route: Get all projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    res.json(await mockDb.getProjects(req.user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Create project
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, location, budget } = req.body;
    if (!name || !location || !budget) {
      return res.status(400).json({ message: "Name, Location and Budget are required" });
    }
    const project = await mockDb.createProject(req.body, req.user);
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get project by id
app.get('/api/projects/:id', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const project = await mockDb.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Add a project phase
app.post('/api/projects/:id/phases', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Phase name is required" });
    }
    const phase = await mockDb.addProjectPhase(req.params.id, req.body);
    if (!phase) return res.status(404).json({ message: "Project not found" });
    res.status(201).json(phase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Update a project phase
app.put('/api/projects/:id/phases/:phaseId', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const phase = await mockDb.updateProjectPhase(req.params.id, req.params.phaseId, req.body);
    if (!phase) return res.status(404).json({ message: "Project or Phase not found" });
    res.json(phase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Delete a project phase
app.delete('/api/projects/:id/phases/:phaseId', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const deleted = await mockDb.deleteProjectPhase(req.params.id, req.params.phaseId);
    if (!deleted) return res.status(404).json({ message: "Project or Phase not found" });
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get project budget
app.get('/api/projects/:id/budget', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const budget = await mockDb.getBudget(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget details not found" });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Update budget categories
app.put('/api/projects/:id/budget', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { categories } = req.body;
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ message: "Categories array is required" });
    }
    const budget = await mockDb.updateBudgetCategories(req.params.id, categories);
    if (!budget) return res.status(404).json({ message: "Project or Budget not found" });
    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get materials list for a project
app.get('/api/projects/:id/materials', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    res.json(await mockDb.getMaterials(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Add a material
app.post('/api/projects/:id/materials', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { name, unit, planned, unitRate } = req.body;
    if (!name || !unit || planned === undefined || !unitRate) {
      return res.status(400).json({ message: "Missing required material fields" });
    }
    const mat = await mockDb.addMaterial(req.params.id, req.body);
    res.status(201).json(mat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Update material stock/cost
app.put('/api/projects/:id/materials/:materialId', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const mat = await mockDb.updateMaterial(req.params.id, req.params.materialId, req.body);
    if (!mat) return res.status(404).json({ message: "Material not found" });
    res.json(mat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Delete a material
app.delete('/api/projects/:id/materials/:materialId', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const deleted = await mockDb.deleteMaterial(req.params.id, req.params.materialId);
    if (!deleted) return res.status(404).json({ message: "Material not found" });
    res.json({ message: "Material deleted successfully", deleted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get daily tracking logs
app.get('/api/projects/:id/daily-tracking', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    res.json(await mockDb.getDailyTracking(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Create daily tracking log entry
app.post('/api/projects/:id/daily-tracking', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const entry = await mockDb.createDailyEntry(req.params.id, req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get inventory logs
app.get('/api/projects/:id/inventory', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    res.json(await mockDb.getInventoryLogs(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Record inventory transaction (Stock In/Out)
app.post('/api/projects/:id/inventory', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { material, type, quantity, unit } = req.body;
    if (!material || !type || !quantity || !unit) {
      return res.status(400).json({ message: "Missing inventory details" });
    }
    const log = await mockDb.addInventoryLog(req.params.id, req.body);
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get procurement dashboard
app.get('/api/projects/:id/procurement', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    res.json(await mockDb.getProcurement(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Create purchase request
app.post('/api/projects/:id/procurement', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { material, quantity, unit } = req.body;
    if (!material || !quantity || !unit) {
      return res.status(400).json({ message: "Missing procurement item details" });
    }
    const request = await mockDb.createProcurementRequest(req.params.id, req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Update procurement workflow status
app.put('/api/projects/:id/procurement/:requestId', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });
    const reqItem = await mockDb.updateProcurementStatus(req.params.id, req.params.requestId, status);
    if (!reqItem) return res.status(404).json({ message: "Procurement request not found" });
    res.json(reqItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route: Get project alerts
app.get('/api/projects/:id/alerts', authenticateToken, authorizeProjectAccess, async (req, res) => {
  try {
    res.json(await mockDb.getAlerts(req.params.id));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Serve the API
app.listen(PORT, () => {
  console.log(`BuildTrack Server running on http://localhost:${PORT}`);
});
