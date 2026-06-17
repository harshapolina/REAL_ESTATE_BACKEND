import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, ShieldCheck, Mail, Bell, Shield } from 'lucide-react';

export default function SettingsPage({ project }) {
  const [thresholds, setThresholds] = useState({
    cementLow: 200,
    steelLow: 15,
    budgetWarning: 90,
    costOverrunLimit: 10
  });
  const [notifyChannels, setNotifyChannels] = useState({
    email: true,
    sms: false,
    system: true
  });
  const [success, setSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-base font-extrabold text-slate-800">Workspace Settings</h2>
        <p className="text-[10px] text-slate-400 font-medium">Configure project configurations, warning thresholds, and notification alerts.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
        
        {/* Success Notice */}
        {success && (
          <div className="rounded-xl border border-green-150 bg-green-50 p-4 text-xs font-medium text-green-700 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-green-500" />
            <span>Settings saved successfully. Threshold baselines updated in cost engine.</span>
          </div>
        )}

        {/* Cost Limits Threshold Box */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4.5 w-4.5 text-orange-500" />
            <h4 className="text-xs font-bold text-slate-850">Alert & Warning Thresholds</h4>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Cement Low Stock Warning (Bags)</label>
              <input 
                type="number"
                value={thresholds.cementLow}
                onChange={e => setThresholds({ ...thresholds, cementLow: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Steel Low Stock Warning (Tons)</label>
              <input 
                type="number"
                value={thresholds.steelLow}
                onChange={e => setThresholds({ ...thresholds, steelLow: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Budget Allocation Warning Limit (%)</label>
              <input 
                type="number"
                value={thresholds.budgetWarning}
                onChange={e => setThresholds({ ...thresholds, budgetWarning: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-700 mb-1">Max Cost Overrun Flag Limit (%)</label>
              <input 
                type="number"
                value={thresholds.costOverrunLimit}
                onChange={e => setThresholds({ ...thresholds, costOverrunLimit: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-800 focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Communication Channels */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-premium">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-4.5 w-4.5 text-blue-500" />
            <h4 className="text-xs font-bold text-slate-850">Alert Delivery Channels</h4>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={notifyChannels.email}
                onChange={e => setNotifyChannels({ ...notifyChannels, email: e.target.checked })}
                className="rounded border-slate-350 text-primary h-4 w-4"
              />
              Email Alerts (Daily digests and urgent stockout alerts)
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={notifyChannels.sms}
                onChange={e => setNotifyChannels({ ...notifyChannels, sms: e.target.checked })}
                className="rounded border-slate-350 text-primary h-4 w-4"
              />
              SMS Notifications (Critical material delivery delays)
            </label>
            <label className="flex items-center gap-3 text-xs font-semibold text-slate-700 cursor-pointer">
              <input 
                type="checkbox"
                checked={notifyChannels.system}
                onChange={e => setNotifyChannels({ ...notifyChannels, system: e.target.checked })}
                className="rounded border-slate-350 text-primary h-4 w-4"
              />
              In-App Notification Cards (Dashboard and Sidebar highlights)
            </label>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-primary-hover shadow-premium transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
}
