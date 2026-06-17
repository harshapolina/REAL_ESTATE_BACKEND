import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { 
  Edit2, 
  Trash2, 
  Plus, 
  Download, 
  Check, 
  Info,
  Calendar,
  Building,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { api } from '../services/api';
import { formatRupees } from './Dashboard';

export default function ProjectPlanning({ project, setProject }) {
  const navigate = useNavigate();
  const [details, setDetails] = useState({ ...project });
  const [phases, setPhases] = useState(project.phases || []);
  const [materials, setMaterials] = useState([]);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddPhase, setShowAddPhase] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newMat, setNewMat] = useState({
    name: '',
    unit: 'Bags',
    planned: '',
    unitRate: ''
  });

  const [newPhase, setNewPhase] = useState({
    name: '',
    targetArea: '',
    duration: '',
    budget: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    setDetails({ ...project });
    setPhases(project.phases || []);
  }, [project]);

  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!newPhase.name || !newPhase.targetArea || !newPhase.duration || !newPhase.budget) return;

    try {
      const created = await api.addProjectPhase(project.id, {
        name: newPhase.name,
        targetArea: newPhase.targetArea,
        duration: newPhase.duration,
        budget: Number(newPhase.budget),
        status: newPhase.status
      });
      setPhases([...phases, created]);
      setShowAddPhase(false);
      setNewPhase({
        name: '',
        targetArea: '',
        duration: '',
        budget: '',
        status: 'Upcoming'
      });
      if (setProject) {
        const updatedProj = await api.getProjectById(project.id);
        setProject(updatedProj);
      }
    } catch (err) {
      console.error("Error adding project phase:", err);
    }
  };

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const data = await api.getMaterials(project.id);
        setMaterials(data);
      } catch (err) {
        console.error("Error loading planned materials:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [project.id]);

  const handleSaveDetails = async () => {
    try {
      const updated = await api.updateProject(project.id, {
        area: Number(details.area),
        budget: Number(details.budget),
        duration: details.duration,
        startDate: details.startDate,
        endDate: details.endDate
      });
      if (updated) {
        setProject(updated);
        setIsEditingDetails(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!newMat.name || !newMat.planned || !newMat.unitRate) return;

    try {
      const created = await api.addMaterial(project.id, {
        name: newMat.name,
        unit: newMat.unit,
        planned: Number(newMat.planned),
        unitRate: Number(newMat.unitRate),
        purchased: 0,
        used: 0
      });
      setMaterials([...materials, created]);
      setShowAddMaterial(false);
      setNewMat({ name: '', unit: 'Bags', planned: '', unitRate: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMaterialRate = async (id, rate) => {
    try {
      const updated = await api.updateMaterial(project.id, id, { unitRate: Number(rate) });
      if (updated) {
        setMaterials(materials.map(m => m.id === id ? updated : m));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    if (fileType === 'csv') {
      reader.onload = async (evt) => {
        try {
          const text = evt.target.result;
          await parseAndImportCSV(text);
        } catch (err) {
          console.error(err);
          alert("Error parsing CSV. Format should be: MaterialName,Unit,PlannedQty,UnitRate");
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'xlsx' || fileType === 'xls') {
      reader.onload = async (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          let importCount = 0;
          // Format expected: Row 0 is headers (Material, Unit, PlannedQty, UnitRate)
          // Data starts at Row 1
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length < 4) continue;
            
            const name = String(row[0] || '').trim();
            const unit = String(row[1] || '').trim();
            const planned = Number(row[2]);
            const unitRate = Number(row[3]);
            
            if (isNaN(planned) || isNaN(unitRate) || !name) continue;
            
            await api.addMaterial(project.id, {
              name,
              unit,
              planned,
              unitRate,
              purchased: 0,
              used: 0
            });
            importCount++;
          }
          
          const updatedList = await api.getMaterials(project.id);
          setMaterials(updatedList);
          if (setProject) {
            const updatedProj = await api.getProjectById(project.id);
            setProject(updatedProj);
          }
          alert(`Successfully imported ${importCount} baseline materials from Excel!`);
        } catch (err) {
          console.error(err);
          alert("Error parsing Excel file. Ensure sheet contains headers in the first row and data in columns: Material, Unit, PlannedQty, UnitRate");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Unsupported file format. Please upload a .csv, .xlsx, or .xls file.");
    }
  };

  const parseAndImportCSV = async (text) => {
    const lines = text.split(/\r?\n/);
    let importCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const parts = line.split(',');
      if (parts.length < 4) continue;
      
      const name = parts[0].trim();
      const unit = parts[1].trim();
      const planned = Number(parts[2].trim());
      const unitRate = Number(parts[3].trim());
      
      if (isNaN(planned) || isNaN(unitRate) || !name) continue;
      
      await api.addMaterial(project.id, {
        name,
        unit,
        planned,
        unitRate,
        purchased: 0,
        used: 0
      });
      importCount++;
    }
    
    const updatedList = await api.getMaterials(project.id);
    setMaterials(updatedList);
    if (setProject) {
      const updatedProj = await api.getProjectById(project.id);
      setProject(updatedProj);
    }
    alert(`Successfully imported ${importCount} baseline materials from CSV!`);
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this baseline material?")) return;
    try {
      await api.deleteMaterial(project.id, id);
      setMaterials(materials.filter(m => m.id !== id));
      if (setProject) {
        const updatedProj = await api.getProjectById(project.id);
        setProject(updatedProj);
      }
    } catch (err) {
      console.error("Error deleting baseline material:", err);
    }
  };

  const totalEstimatedCost = materials.reduce((sum, m) => sum + (m.planned * m.unitRate), 0);

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">Project Planning</h2>
          <p className="text-[10px] text-slate-400 font-medium">Define project details, phases, and baseline material plan.</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditingDetails ? (
            <button 
              onClick={handleSaveDetails}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              Save Details
            </button>
          ) : (
            <button 
              onClick={() => setIsEditingDetails(true)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 shadow-premium transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5 text-slate-400" />
              Edit Details
            </button>
          )}
        </div>
      </div>

      {/* Project Details Grid */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium">
        <h4 className="text-xs font-bold text-slate-800 mb-4">Project Details</h4>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
              <Building className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Area (SFT)</p>
              {isEditingDetails ? (
                <input 
                  type="number"
                  value={details.area || ''}
                  onChange={e => setDetails({ ...details, area: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs font-bold focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-slate-700 mt-0.5">{Number(project.area || 0).toLocaleString()} SFT</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
              {isEditingDetails ? (
                <input 
                  type="text"
                  value={details.duration || ''}
                  onChange={e => setDetails({ ...details, duration: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs font-bold focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-slate-700 mt-0.5">{project.duration}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-500">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Date</p>
              {isEditingDetails ? (
                <input 
                  type="date"
                  value={details.startDate || ''}
                  onChange={e => setDetails({ ...details, startDate: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-slate-700 mt-0.5">{project.startDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">End Date</p>
              {isEditingDetails ? (
                <input 
                  type="date"
                  value={details.endDate || ''}
                  onChange={e => setDetails({ ...details, endDate: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs focus:outline-none"
                />
              ) : (
                <p className="text-xs font-bold text-slate-700 mt-0.5">{project.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:col-span-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
              <DollarSign className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</p>
              {isEditingDetails ? (
                <input 
                  type="number"
                  value={details.budget || ''}
                  onChange={e => setDetails({ ...details, budget: e.target.value })}
                  className="mt-0.5 w-full rounded border border-slate-200 px-1 py-0.5 text-xs font-bold focus:outline-none"
                />
              ) : (
                <p className="text-xs font-black text-slate-700 mt-0.5">{formatRupees(project.budget)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Phases */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-slate-800">Project Phases</h4>
          <button 
            onClick={() => setShowAddPhase(true)}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-hover"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Phase</span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {phases.length > 0 ? (
            phases.map((ph, idx) => (
              <div key={ph.id || idx} className="rounded-xl border border-slate-200/80 p-4 relative bg-slate-50/20">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400">Phase {idx + 1}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                    ph.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {ph.status}
                  </span>
                </div>
                <h5 className="mt-2 text-xs font-bold text-slate-700">{ph.name}</h5>
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-[10px] font-semibold text-slate-500">
                  <div>
                    <p className="text-[8px] text-slate-400">Target Area</p>
                    <p className="mt-0.5 text-slate-700">{ph.targetArea}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-400">Duration</p>
                    <p className="mt-0.5 text-slate-700 truncate">{ph.duration.split(' ')[2] || ph.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-400">Budget</p>
                    <p className="mt-0.5 text-slate-700">{formatRupees(ph.budget)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 py-6 text-center text-xs text-slate-400 border border-dashed rounded-lg">
              No phases defined for this project.
            </div>
          )}
        </div>
      </div>

      {/* Planned Materials Baseline Matrix */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-800">Planned Materials (Baseline)</h4>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Baseline estimation quantity and costing for materials</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 shadow-premium transition-colors cursor-pointer">
              <Download className="h-3.5 w-3.5 text-slate-400" />
              <span>Import Excel/CSV</span>
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls" 
                onChange={handleImportFile} 
                className="hidden" 
              />
            </label>
            <button 
              onClick={() => setShowAddMaterial(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-[10px] font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Material</span>
            </button>
          </div>
        </div>

        {/* Spreadsheet Matrix Table */}
        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-2.5 px-4 font-bold text-[10px] uppercase w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase min-w-[150px]">Material</th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase w-20">Unit</th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-36">Total Planned Qty</th>
                <th className="py-2.5 px-3 font-bold text-[10px] uppercase text-right w-24">Unit Rate</th>
                <th className="py-2.5 px-4 font-bold text-[10px] uppercase text-right w-36">Total Cost</th>
                <th className="py-2.5 px-4 font-bold text-[10px] uppercase text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">Loading materials baseline matrix...</td>
                </tr>
              ) : materials.length > 0 ? (
                materials.map((mat, idx) => (
                  <tr key={mat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2 px-4 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{mat.name}</td>
                    <td className="py-2 px-3 text-slate-500">{mat.unit}</td>
                    <td className="py-2 px-3 text-right font-semibold">
                      {Number(mat.planned || 0).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <input 
                        type="number"
                        defaultValue={mat.unitRate}
                        onBlur={(e) => handleUpdateMaterialRate(mat.id, e.target.value)}
                        className="w-16 rounded border border-slate-200 px-1 py-0.5 text-right text-xs focus:border-primary focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-4 text-right font-bold text-slate-800">
                      {formatRupees(mat.planned * mat.unitRate)}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <button 
                        onClick={() => handleDeleteMaterial(mat.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">No baseline materials configured yet.</td>
                </tr>
              )}
            </tbody>
            {/* Table Summation Footer */}
            {!loading && materials.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50/50 border-t-2 border-slate-200 font-bold text-slate-800">
                  <td colSpan="5" className="py-3 px-4 text-left font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Total Estimated Baseline Cost</td>
                  <td className="py-3 px-4 text-right font-black text-primary text-sm">{formatRupees(totalEstimatedCost)}</td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAddMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-dropdown">
            <h3 className="text-sm font-bold text-slate-800">Add Planned Material</h3>
            
            <form onSubmit={handleAddMaterial} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Material Name</label>
                <input 
                  type="text" 
                  required
                  value={newMat.name}
                  onChange={e => setNewMat({...newMat, name: e.target.value})}
                  placeholder="e.g. Cement (53 Grade)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Unit</label>
                  <select
                    value={newMat.unit}
                    onChange={e => setNewMat({...newMat, unit: e.target.value})}
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                  >
                    <option>Bags</option>
                    <option>Tons</option>
                    <option>Loads</option>
                    <option>Nos</option>
                    <option>Cum</option>
                    <option>Sheets</option>
                    <option>Kg</option>
                    <option>Lump Sum</option>
                    <option>Liters</option>
                    <option>SFT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Planned Qty</label>
                  <input 
                    type="number" 
                    required
                    value={newMat.planned}
                    onChange={e => setNewMat({...newMat, planned: e.target.value})}
                    placeholder="e.g. 1000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Estimated Unit Rate (₹)</label>
                <input 
                  type="number" 
                  required
                  value={newMat.unitRate}
                  onChange={e => setNewMat({...newMat, unitRate: e.target.value})}
                  placeholder="e.g. 450"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
                >
                  Add Baseline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Phase Modal */}
      {showAddPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-dropdown">
            <h3 className="text-sm font-bold text-slate-800">Add Project Phase</h3>
            
            <form onSubmit={handleAddPhase} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Phase Name</label>
                <input 
                  type="text" 
                  required
                  value={newPhase.name}
                  onChange={e => setNewPhase({...newPhase, name: e.target.value})}
                  placeholder="e.g. Foundation & Columns"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Target Area</label>
                <input 
                  type="text" 
                  required
                  value={newPhase.targetArea}
                  onChange={e => setNewPhase({...newPhase, targetArea: e.target.value})}
                  placeholder="e.g. 20,000 SFT"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Duration</label>
                  <input 
                    type="text" 
                    required
                    value={newPhase.duration}
                    onChange={e => setNewPhase({...newPhase, duration: e.target.value})}
                    placeholder="e.g. 01 May - 30 Jun"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Budget (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newPhase.budget}
                    onChange={e => setNewPhase({...newPhase, budget: e.target.value})}
                    placeholder="e.g. 12000000"
                    className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={newPhase.status}
                  onChange={e => setNewPhase({...newPhase, status: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                >
                  <option>Active</option>
                  <option>Upcoming</option>
                  <option>Completed</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddPhase(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
                >
                  Add Phase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
