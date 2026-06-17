import React, { useState } from 'react';
import { Users, Plus, ShieldCheck, Mail, ShieldAlert, Check } from 'lucide-react';

export default function TeamRoles({ project }) {
  const [members, setMembers] = useState([
    { id: 1, name: "Arjun Reddy", email: "arjun@buildtrack.com", role: "Administrator", status: "Active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
    { id: 2, name: "Sanjay Kumar", email: "sanjay@buildtrack.com", role: "Project Manager", status: "Active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
    { id: 3, name: "Meera Nair", email: "meera@buildtrack.com", role: "Site Engineer", status: "Active", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" },
    { id: 4, name: "Lokesh Jain", email: "lokesh@supermetals.com", role: "Vendor Partner", status: "Pending", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150" }
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: 'Site Engineer'
  });

  const handleInvite = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email) return;

    setMembers([...members, {
      id: Date.now(),
      name: newMember.name,
      email: newMember.email,
      role: newMember.role,
      status: "Pending",
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150`
    }]);
    setShowAddModal(false);
    setNewMember({ name: '', email: '', role: 'Site Engineer' });
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-800">Team & Roles</h2>
          <p className="text-[10px] text-slate-400 font-medium">Manage project members, access levels, and invite collaborators.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Members Listing grid */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium">
        <h4 className="text-xs font-bold text-slate-800 mb-4 font-sans">Active Collaborators</h4>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => (
            <div 
              key={member.id} 
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-premium flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={member.avatar} 
                    alt={member.name} 
                    className="h-10 w-10 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 leading-snug">{member.name}</h5>
                    <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{member.role}</p>
                  </div>
                </div>
                <span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                  member.status === 'Active' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-orange-50 text-orange-655 border border-orange-100 animate-pulse'
                }`}>
                  {member.status}
                </span>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between text-[10px] font-semibold text-slate-500">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[120px]">{member.email}</span>
                </div>
                <button className="text-primary hover:text-primary-hover font-bold text-[9px]">
                  Permissions
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl border border-slate-100 bg-white p-6 shadow-dropdown">
            <h3 className="text-sm font-bold text-slate-800">Invite Team Collaborator</h3>
            
            <form onSubmit={handleInvite} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={newMember.name}
                  onChange={e => setNewMember({...newMember, name: e.target.value})}
                  placeholder="e.g. Ramesh Dev"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={newMember.email}
                  onChange={e => setNewMember({...newMember, email: e.target.value})}
                  placeholder="e.g. ramesh@buildtrack.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">Select Access Level / Role</label>
                <select
                  value={newMember.role}
                  onChange={e => setNewMember({...newMember, role: e.target.value})}
                  className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
                >
                  <option>Administrator</option>
                  <option>Project Manager</option>
                  <option>Site Engineer</option>
                  <option>Vendor Partner</option>
                  <option>Financial Auditor</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
