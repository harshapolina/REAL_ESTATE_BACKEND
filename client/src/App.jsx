import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import Overview from './pages/Overview';
import ProjectPlanning from './pages/ProjectPlanning';
import BudgetPlanning from './pages/BudgetPlanning';
import DailyTracking from './pages/DailyTracking';
import MaterialsCenter from './pages/MaterialsCenter';
import MaterialDetail from './pages/MaterialDetail';
import PlannedVsActual from './pages/PlannedVsActual';
import Inventory from './pages/Inventory';
import ForecastAlerts from './pages/ForecastAlerts';
import Procurement from './pages/Procurement';
import Reports from './pages/Reports';
import TeamRoles from './pages/TeamRoles';
import Settings from './pages/Settings';
import { api } from './services/api';

// Route guards
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('buildtrack_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function WorkspaceWrapper() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await api.getProjectById(id);
        setProject(data);
        setError(null);
      } catch (err) {
        console.error("Error loading project:", err);
        setError(err.message || "Failed to load project details");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <span className="text-sm font-medium text-slate-500">Loading project workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-800">Project Not Found</h2>
        <p className="text-sm text-slate-500">{error || "The requested project could not be found."}</p>
        <button 
          onClick={() => navigate('/')} 
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <Layout project={project} setProject={setProject}>
      <Routes>
        <Route path="overview" element={<Overview project={project} />} />
        <Route path="planning" element={<ProjectPlanning project={project} setProject={setProject} />} />
        <Route path="budget" element={<BudgetPlanning project={project} />} />
        <Route path="daily-tracking" element={<DailyTracking project={project} />} />
        <Route path="materials" element={<MaterialsCenter project={project} />} />
        <Route path="materials/:materialId" element={<MaterialDetail project={project} />} />
        <Route path="planned-vs-actual" element={<PlannedVsActual project={project} />} />
        <Route path="inventory" element={<Inventory project={project} />} />
        <Route path="forecast" element={<ForecastAlerts project={project} />} />
        <Route path="procurement" element={<Procurement project={project} />} />
        <Route path="reports" element={<Reports project={project} />} />
        <Route path="team" element={<TeamRoles project={project} />} />
        <Route path="settings" element={<Settings project={project} />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:id/*" 
          element={
            <ProtectedRoute>
              <WorkspaceWrapper />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
