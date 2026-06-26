import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Project from './models/Project.js';
import Budget from './models/Budget.js';
import Material from './models/Material.js';
import DailyTracking from './models/DailyTracking.js';
import InventoryLog from './models/InventoryLog.js';
import Procurement from './models/Procurement.js';
import Alert from './models/Alert.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

export async function connectDB() {
  const connString = process.env.MONGO_URI;
  if (!connString) {
    console.error("MONGO_URI environment variable is missing in .env");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(connString, {
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed DB if empty or outdated
    await seedDB();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}

async function seedDB() {
  try {
    // Check if we need to re-seed due to schema updates (missing companyId on Super Admin u-2, or old role 'User')
    const outdatedUser = await User.findOne({ 
      $or: [
        { role: 'User' },
        { username: { $exists: false } },
        { role: 'Super Admin', companyId: { $exists: false } }
      ] 
    });
    if (outdatedUser) {
      console.log("Database contains outdated schemas (obsolete roles/fields). Dropping database to re-seed...");
      await mongoose.connection.db.dropDatabase();
    }

    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log("Database already populated. Skipping initial seeding.");
      return;
    }

    if (!fs.existsSync(DATA_FILE)) {
      console.log("No db.json file found to seed. Skipping seeding.");
      return;
    }

    console.log("MongoDB is empty. Seeding data from local db.json with SaaS roles...");
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const data = JSON.parse(raw);

    // Seed Users (Map to new SaaS fields)
    const usersToSeed = [
      {
        id: 'u-1',
        name: 'Arjun Reddy',
        username: 'arjun',
        email: 'arjun@buildtrack.com',
        password: 'password123',
        role: 'Platform Owner',
        isActive: true,
        assignedProjects: [],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        id: 'u-2',
        name: 'Sanjay Kumar',
        username: 'sanjay',
        email: 'sanjay@buildtrack.com',
        password: 'password123',
        role: 'Super Admin',
        companyId: 'u-2',
        parentId: 'u-1',
        isActive: true,
        assignedProjects: [],
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        id: 'u-3',
        name: 'Meera Nair',
        username: 'meera',
        email: 'meera@buildtrack.com',
        password: 'password123',
        role: 'Manager',
        companyId: 'u-2',
        parentId: 'u-2',
        isActive: true,
        assignedProjects: ['p-1'],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        id: 'u-4',
        name: 'Ramesh Kumar',
        username: 'ramesh',
        email: 'ramesh@buildtrack.com',
        password: 'password123',
        role: 'Site Manager',
        companyId: 'u-2',
        parentId: 'u-3',
        isActive: true,
        assignedProjects: ['p-1'],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        id: 'u-5',
        name: 'Suresh Sen',
        username: 'suresh',
        email: 'suresh@buildtrack.com',
        password: 'password123',
        role: 'Employee',
        companyId: 'u-2',
        parentId: 'u-3',
        isActive: true,
        assignedProjects: ['p-1'],
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
      }
    ];

    await User.insertMany(usersToSeed);
    console.log(`Seeded ${usersToSeed.length} Users with new hierarchical SaaS roles.`);


    // Seed Projects
    if (data.projects && data.projects.length > 0) {
      const projectsToSeed = data.projects.map(p => {
        let managerId = null;
        if (p.id === 'p-1') {
          managerId = 'u-3'; // Assign Meera as manager for Project 1
        }
        return {
          ...p,
          ownerId: 'u-2', // Owned by Sanjay (Client Admin)
          companyId: 'u-2', // Associated with Sanjay's company
          managerId
        };
      });

      await Project.insertMany(projectsToSeed);
      console.log(`Seeded ${projectsToSeed.length} Projects with owner and manager mapping.`);
    }

    // Run migration to ensure any user-created legacy projects have companyId set
    await Project.updateMany(
      { companyId: { $exists: false } },
      [
        { $set: { companyId: "$ownerId" } } // Set companyId to be the ownerId (since owner is the Super Admin)
      ]
    );
    console.log("Migration: Ensured all projects in DB have companyId defined.");

    // Seed Budgets
    if (data.budgets) {
      let count = 0;
      for (const [projectId, budget] of Object.entries(data.budgets)) {
        await Budget.create({ projectId, ...budget });
        count++;
      }
      console.log(`Seeded ${count} Budgets.`);
    }

    // Seed Materials
    if (data.materials) {
      let count = 0;
      for (const [projectId, list] of Object.entries(data.materials)) {
        if (list && list.length > 0) {
          const docs = list.map(item => ({ projectId, ...item }));
          await Material.insertMany(docs);
          count += docs.length;
        }
      }
      console.log(`Seeded ${count} Material items.`);
    }

    // Seed DailyTracking
    if (data.dailyTracking) {
      let count = 0;
      for (const [projectId, list] of Object.entries(data.dailyTracking)) {
        if (list && list.length > 0) {
          const docs = list.map(item => ({ projectId, ...item }));
          await DailyTracking.insertMany(docs);
          count += docs.length;
        }
      }
      console.log(`Seeded ${count} DailyTracking logs.`);
    }

    // Seed InventoryLogs
    if (data.inventoryLogs) {
      let count = 0;
      for (const [projectId, list] of Object.entries(data.inventoryLogs)) {
        if (list && list.length > 0) {
          const docs = list.map(item => ({ projectId, ...item }));
          await InventoryLog.insertMany(docs);
          count += docs.length;
        }
      }
      console.log(`Seeded ${count} Inventory logs.`);
    }

    // Seed Procurement
    if (data.procurement) {
      let count = 0;
      for (const [projectId, list] of Object.entries(data.procurement)) {
        if (list && list.length > 0) {
          const docs = list.map(item => ({ projectId, ...item }));
          await Procurement.insertMany(docs);
          count += docs.length;
        }
      }
      console.log(`Seeded ${count} Procurement requests.`);
    }

    // Seed Alerts
    if (data.alerts) {
      let count = 0;
      for (const [projectId, list] of Object.entries(data.alerts)) {
        if (list && list.length > 0) {
          const docs = list.map(item => ({ projectId, ...item }));
          await Alert.insertMany(docs);
          count += docs.length;
        }
      }
      console.log(`Seeded ${count} Project alerts.`);
    }

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error(`Error seeding MongoDB: ${error.message}`);
  }
}
