
import React, { useState, useEffect } from 'react';
import { AUDIT_LOGS, STAFF_ROSTER } from '../constants';
import { Settings as SettingsIcon, Users, Shield, FileText, Printer, Lock, Save, RotateCcw, Plus, Check, Search, Activity, Wifi, WifiOff, FileWarning, BarChart2, Download, Loader2, X, User, MapPin, Store, Trash2 } from 'lucide-react';
import { Permission, SystemUser, Role, Branch, Printer as PrinterType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useApp } from '../context/AppContext';

type ViewMode = 'GENERAL' | 'USERS' | 'ROLES' | 'BRANCHES' | 'PRINTERS' | 'AUDIT' | 'REPORTS';

interface SettingsProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-brand-red' : 'bg-gray-300 dark:bg-neutral-700'}`}
  >
    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`}></div>
  </button>
);

const PrinterModal = ({ 
  printer, 
  onClose, 
  onSave,
  onDelete 
}: { 
  printer?: PrinterType | null; 
  onClose: () => void; 
  onSave: (p: Partial<PrinterType>) => void; 
  onDelete?: (id: string) => void;
}) => {
  const [formData, setFormData] = useState<Partial<PrinterType>>(
    printer || {
      name: '',
      type: 'RECEIPT',
      ipAddress: '192.168.1.xxx',
      location: '',
      status: 'ONLINE'
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {printer ? 'Edit Printer' : 'Add New Printer'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Printer Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Cashier Main"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              <option value="RECEIPT">Receipt Printer (Thermal)</option>
              <option value="KITCHEN">Kitchen Printer (Impact)</option>
              <option value="LABEL">Label Printer (Sticker)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">IP Address</label>
            <input 
              type="text" 
              value={formData.ipAddress}
              onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-mono"
              placeholder="192.168.1.100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Location / Station</label>
            <input 
              type="text" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Hot Kitchen"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center gap-3">
           {printer && onDelete ? (
             <button 
                onClick={() => onDelete(printer.id)} 
                className="px-4 py-3 rounded-lg font-bold text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
             >
                <Trash2 size={18} />
             </button>
           ) : <div></div>}
           
           <div className="flex gap-3">
             <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Cancel</button>
             <button 
               onClick={() => onSave(formData)}
               disabled={!formData.name || !formData.ipAddress}
               className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Save Printer
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

const UserModal = ({ 
  user, 
  roles, 
  onClose, 
  onSave 
}: { 
  user?: SystemUser | null; 
  roles: Role[]; 
  onClose: () => void; 
  onSave: (user: Partial<SystemUser>) => void; 
}) => {
  const [formData, setFormData] = useState<Partial<SystemUser>>(
    user || {
      username: '',
      roleId: roles[0]?.id || '',
      status: 'ACTIVE',
      staffId: ''
    }
  );

  const handleSubmit = () => {
    if (!formData.username || !formData.roleId) return;
    const selectedRole = roles.find(r => r.id === formData.roleId);
    onSave({
        ...formData,
        roleName: selectedRole?.name || 'Unknown'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Username</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="j.doe"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Role</label>
            <select 
              value={formData.roleId}
              onChange={(e) => setFormData({...formData, roleId: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Link Staff Member (HR)</label>
            <select 
              value={formData.staffId || ''}
              onChange={(e) => setFormData({...formData, staffId: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              <option value="">-- No Link --</option>
              {STAFF_ROSTER.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.role})</option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 dark:text-neutral-500 mt-1">Links this login to a specific employee for performance tracking.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Account Status</label>
            <div className="flex gap-2">
               <button 
                 onClick={() => setFormData({...formData, status: 'ACTIVE'})}
                 className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-900 text-green-600 dark:text-green-500' : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-500'}`}
               >
                 ACTIVE
               </button>
               <button 
                 onClick={() => setFormData({...formData, status: 'LOCKED'})}
                 className={`flex-1 py-2 rounded-lg text-xs font-bold border ${formData.status === 'LOCKED' ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-500' : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-500'}`}
               >
                 LOCKED
               </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Cancel</button>
           <button 
             onClick={handleSubmit}
             disabled={!formData.username}
             className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Save User
           </button>
        </div>
      </div>
    </div>
  );
};

const BranchModal = ({ 
  branch, 
  onClose, 
  onSave 
}: { 
  branch?: Branch | null; 
  onClose: () => void; 
  onSave: (branch: Partial<Branch>) => void; 
}) => {
  const [formData, setFormData] = useState<Partial<Branch>>(
    branch || {
      name: '',
      type: 'STORE',
      currency: 'KWD',
      taxRate: 0
    }
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {branch ? 'Edit Branch' : 'Add New Branch'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Branch Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Dubai Mall"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Type</label>
            <select 
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
            >
              <option value="STORE">Store (POS Active)</option>
              <option value="KITCHEN">Central Kitchen</option>
              <option value="WAREHOUSE">Warehouse / Storage</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Currency</label>
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              >
                <option value="KWD">KWD</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Tax Rate %</label>
              <input 
                type="number" 
                value={formData.taxRate}
                onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Cancel</button>
           <button 
             onClick={() => onSave(formData)}
             disabled={!formData.name}
             className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             Save Branch
           </button>
        </div>
      </div>
    </div>
  );
};

export const Settings: React.FC<SettingsProps> = ({ onNotify }) => {
  const { theme } = useApp();
  const { 
    settings, updateSettings, 
    users, addUser, updateUser, 
    roles, updateRolePermissions,
    printers, addPrinter, updatePrinter, removePrinter,
    branches, addBranch, updateBranch 
  } = useApp();
  
  const [view, setView] = useState<ViewMode>('GENERAL');
  const [activeRole, setActiveRole] = useState<string>('MANAGER');
  
  // User Management State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);

  // Branch Management State
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Printer Management State
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [isScanningPrinters, setIsScanningPrinters] = useState(false);

  // Audit Log State
  const [auditSearch, setAuditSearch] = useState('');

  // Local Form State for General Settings
  const [formSettings, setFormSettings] = useState(settings);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  // Report State
  const [reportType, setReportType] = useState('SALES');
  const [reportPeriod, setReportPeriod] = useState('LAST_QUARTER');
  const [groupBy, setGroupBy] = useState('CATEGORY');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState<any>(null);

  const generateMockData = () => {
    // ... [Same implementation as before] ...
    const multiplier = {
      'TODAY': 1,
      'THIS_WEEK': 7,
      'THIS_MONTH': 30,
      'LAST_QUARTER': 90,
      'YTD': 365
    }[reportPeriod] || 1;

    let categories: string[] = [];
    if (groupBy === 'CATEGORY') categories = ['Main Courses', 'Appetizers', 'Beverages', 'Desserts', 'Shisha'];
    else if (groupBy === 'DAY_OF_WEEK') categories = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    else if (groupBy === 'HOUR_OF_DAY') categories = ['12 PM', '1 PM', '2 PM', '6 PM', '7 PM', '8 PM', '9 PM'];
    else if (groupBy === 'SERVER') categories = ['Ahmed', 'Sarah', 'Hassan', 'Maria', 'John'];

    let summary = {};
    let chartData = [];
    let chartConfig = { bar1: '', name1: '', color1: '', bar2: '', name2: '', color2: '' };

    const random = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

    if (reportType === 'SALES') {
      summary = {
        label1: 'Total Revenue', value1: (1250 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label2: 'Net Profit', value2: (350 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label3: 'Gross Margin', value3: '72.5%',
        label4: 'Avg Order Value', value4: '8.500 KWD'
      };
      chartConfig = { bar1: 'revenue', name1: 'Revenue (KWD)', color1: '#EF4444', bar2: 'profit', name2: 'Profit (KWD)', color2: '#22c55e' };
      chartData = categories.map(cat => ({ name: cat, revenue: random(200, 800) * multiplier, profit: random(50, 200) * multiplier }));
    } else if (reportType === 'INVENTORY') {
      summary = {
        label1: 'Total Usage Cost', value1: (450 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label2: 'Waste Cost', value2: (45 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label3: 'Waste %', value3: '3.2%',
        label4: 'Stock Turnover', value4: '4.5x'
      };
      chartConfig = { bar1: 'usage', name1: 'Usage Cost (KWD)', color1: '#3B82F6', bar2: 'waste', name2: 'Waste Cost (KWD)', color2: '#EF4444' };
      chartData = categories.map(cat => ({ name: cat, usage: random(100, 400) * multiplier, waste: random(5, 40) * multiplier }));
    } else if (reportType === 'LABOR') {
      summary = {
        label1: 'Total Labor Cost', value1: (320 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label2: 'Labor %', value2: '18.5%',
        label3: 'Hours Worked', value3: (40 * multiplier).toLocaleString(),
        label4: 'Sales / Labor Hr', value4: '35.000 KWD'
      };
      chartConfig = { bar1: 'cost', name1: 'Labor Cost (KWD)', color1: '#F59E0B', bar2: 'hours', name2: 'Hours Worked', color2: '#6366f1' };
      chartData = categories.map(cat => ({ name: cat, cost: random(50, 150) * multiplier, hours: random(8, 24) * multiplier }));
    } else if (reportType === 'VOID') {
      summary = {
        label1: 'Total Void Amount', value1: (85 * multiplier).toLocaleString(undefined, {maximumFractionDigits: 0}) + ' KWD',
        label2: 'Void Count', value2: (12 * multiplier).toString(),
        label3: '% of Sales', value3: '1.4%',
        label4: 'Auth Manager', value4: 'Most: Ahmed'
      };
      chartConfig = { bar1: 'amount', name1: 'Void Amount (KWD)', color1: '#EF4444', bar2: 'count', name2: 'Void Count', color2: '#a8a29e' };
      chartData = categories.map(cat => ({ name: cat, amount: random(10, 50) * multiplier, count: random(1, 5) * multiplier }));
    }
    return { summary, chartData, chartConfig };
  };
  
  const NavButton = ({ id, icon: Icon, label }: { id: ViewMode, icon: any, label: string }) => (
    <button 
      onClick={() => setView(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-sm font-bold transition-all ${view === id ? 'bg-brand-red text-white shadow-lg shadow-red-900/20' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'}`}
    >
      <Icon size={18} /> {label}
    </button>
  );

  const handleSaveSettings = () => {
    updateSettings(formSettings);
    onNotify('Settings saved successfully.', 'success');
  };

  const handleUserSave = (userData: Partial<SystemUser>) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
      onNotify('User updated successfully.', 'success');
    } else {
      const newUser: SystemUser = {
        id: `u-${Date.now()}`,
        username: userData.username!,
        roleId: userData.roleId!,
        roleName: userData.roleName!,
        status: userData.status || 'ACTIVE',
        staffId: userData.staffId,
        lastLogin: undefined
      };
      addUser(newUser);
      onNotify('New user created successfully.', 'success');
    }
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleBranchSave = (branchData: Partial<Branch>) => {
    if (editingBranch) {
        updateBranch(editingBranch.id, branchData);
        onNotify('Branch updated successfully.', 'success');
    } else {
        const newBranch: Branch = {
            id: `b-${Date.now()}`,
            name: branchData.name!,
            type: branchData.type || 'STORE',
            currency: branchData.currency || 'KWD',
            taxRate: branchData.taxRate || 0
        };
        addBranch(newBranch);
        onNotify('New branch added successfully.', 'success');
    }
    setShowBranchModal(false);
    setEditingBranch(null);
  };

  const handlePrinterSave = (printerData: Partial<PrinterType>) => {
    if (editingPrinter) {
      updatePrinter(editingPrinter.id, printerData);
      onNotify('Printer configuration updated.', 'success');
    } else {
      const newPrinter: PrinterType = {
        id: `p-${Date.now()}`,
        name: printerData.name!,
        type: printerData.type || 'RECEIPT',
        ipAddress: printerData.ipAddress!,
        status: 'ONLINE',
        location: printerData.location || 'Main'
      };
      addPrinter(newPrinter);
      onNotify('New printer added successfully.', 'success');
    }
    setShowPrinterModal(false);
    setEditingPrinter(null);
  };

  const handlePrinterDelete = (id: string) => {
    removePrinter(id);
    setShowPrinterModal(false);
    setEditingPrinter(null);
    onNotify('Printer removed.', 'info');
  };

  const handleScanPrinters = () => {
    setIsScanningPrinters(true);
    setTimeout(() => {
      setIsScanningPrinters(false);
      onNotify('Scan complete. No new devices found.', 'info');
    }, 2000);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportResult(null);
    setTimeout(() => {
        setReportResult(generateMockData());
        setIsGenerating(false);
        onNotify('Report generated successfully.', 'success');
    }, 800);
  };

  const handleExportCSV = () => {
    if (!reportResult?.chartData?.length) {
      onNotify('No data to export', 'error');
      return;
    }
    const data = reportResult.chartData;
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map((row: any) => 
        headers.map(fieldName => {
          const val = row[fieldName];
          const stringVal = String(val);
          return stringVal.includes(',') ? `"${stringVal}"` : stringVal;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `foodika_report_${reportType.toLowerCase()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onNotify('Report downloaded successfully', 'success');
  };

  const filteredAuditLogs = AUDIT_LOGS.filter(log => 
    log.user.toLowerCase().includes(auditSearch.toLowerCase()) || 
    log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black flex overflow-hidden">
      
      {showUserModal && (
        <UserModal 
          user={editingUser} 
          roles={roles} 
          onClose={() => { setShowUserModal(false); setEditingUser(null); }}
          onSave={handleUserSave}
        />
      )}

      {showBranchModal && (
        <BranchModal 
          branch={editingBranch}
          onClose={() => { setShowBranchModal(false); setEditingBranch(null); }}
          onSave={handleBranchSave}
        />
      )}

      {showPrinterModal && (
        <PrinterModal
          printer={editingPrinter}
          onClose={() => { setShowPrinterModal(false); setEditingPrinter(null); }}
          onSave={handlePrinterSave}
          onDelete={editingPrinter ? handlePrinterDelete : undefined}
        />
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-brand-surface border-r border-gray-200 dark:border-neutral-800 flex flex-col p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 px-2 flex items-center gap-2">
          <SettingsIcon className="text-brand-red" /> Admin Panel
        </h2>
        <nav className="space-y-2">
          <NavButton id="GENERAL" icon={SettingsIcon} label="General Settings" />
          <NavButton id="USERS" icon={Users} label="Users & Access" />
          <NavButton id="ROLES" icon={Shield} label="Roles & Permissions" />
          <NavButton id="BRANCHES" icon={MapPin} label="Locations & Branches" />
          <NavButton id="PRINTERS" icon={Printer} label="Printers & Hardware" />
          <NavButton id="REPORTS" icon={BarChart2} label="Reports & Data" />
          <NavButton id="AUDIT" icon={FileText} label="Audit Logs" />
        </nav>
        <div className="mt-auto p-4 bg-gray-100 dark:bg-neutral-900/50 rounded-xl border border-gray-200 dark:border-neutral-800">
           <div className="text-xs text-gray-500 dark:text-neutral-500 font-bold uppercase mb-1">System Status</div>
           <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-sm font-bold"><Activity size={14}/> All Systems Operational</div>
           <div className="text-xs text-gray-500 dark:text-neutral-500 mt-2">Version 2.4.0 (Build 992)</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        
        {/* GENERAL SETTINGS */}
        {view === 'GENERAL' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">General Configuration</h1>
                <p className="text-gray-500 dark:text-neutral-400">Manage basic restaurant details and localization.</p>
             </div>

             <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-6 space-y-6 shadow-sm">
                <div className="grid grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Restaurant Name</label>
                      <input 
                        type="text" 
                        value={formSettings.restaurantName} 
                        onChange={(e) => setFormSettings({...formSettings, restaurantName: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Branch Name</label>
                      <input 
                        type="text" 
                        value={formSettings.branchName} 
                        onChange={(e) => setFormSettings({...formSettings, branchName: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" 
                      />
                   </div>
                </div>
                
                <div className="grid grid-cols-3 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Currency</label>
                      <select 
                        value={formSettings.currency}
                        onChange={(e) => setFormSettings({...formSettings, currency: e.target.value})}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                      >
                         <option>KWD</option>
                         <option>SAR</option>
                         <option>AED</option>
                         <option>USD</option>
                      </select>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Default Tax Rate %</label>
                      <input 
                        type="number" 
                        value={formSettings.taxRate} 
                        onChange={(e) => setFormSettings({...formSettings, taxRate: Number(e.target.value)})}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" 
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Service Charge %</label>
                      <input 
                        type="number" 
                        value={formSettings.serviceCharge} 
                        onChange={(e) => setFormSettings({...formSettings, serviceCharge: Number(e.target.value)})}
                        className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" 
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Receipt Language</label>
                   <div className="flex gap-4">
                      {['EN', 'AR', 'BOTH'].map(lang => (
                        <button 
                          key={lang} 
                          onClick={() => setFormSettings({...formSettings, printLanguage: lang as any})}
                          className={`flex-1 py-3 rounded-lg border font-bold text-sm ${formSettings.printLanguage === lang ? 'bg-brand-red text-white border-brand-red' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border-gray-200 dark:border-neutral-700'}`}
                        >
                           {lang === 'BOTH' ? 'Bilingual (EN/AR)' : lang === 'AR' ? 'Arabic Only' : 'English Only'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="flex justify-end gap-4">
                <button className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 flex items-center gap-2">
                   <RotateCcw size={18} /> Reset
                </button>
                <button 
                  onClick={handleSaveSettings}
                  className="px-6 py-3 rounded-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 flex items-center gap-2"
                >
                   <Save size={18} /> Save Changes
                </button>
             </div>
          </div>
        )}

        {/* USERS */}
        {view === 'USERS' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">User Management</h1>
                    <p className="text-gray-500 dark:text-neutral-400">Manage system access and login credentials.</p>
                 </div>
                 <button 
                   onClick={() => { setEditingUser(null); setShowUserModal(true); }}
                   className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20"
                 >
                    <Plus size={18} /> Add User
                 </button>
              </div>

              <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
                       <tr>
                          <th className="p-4">User</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Last Login</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                       {users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                             <td className="p-4">
                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                   <User size={16} className="text-gray-400 dark:text-neutral-500" />
                                   {user.username}
                                </div>
                                {user.staffId && <div className="text-xs text-gray-500 dark:text-neutral-500 ml-6">Linked to: {user.staffId}</div>}
                             </td>
                             <td className="p-4">
                                <span className="bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 px-2 py-1 rounded text-xs font-bold text-gray-700 dark:text-white">{user.roleName}</span>
                             </td>
                             <td className="p-4">
                                <span className={`flex items-center gap-2 font-bold text-xs ${user.status === 'ACTIVE' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
                                   <div className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                   {user.status}
                                </span>
                             </td>
                             <td className="p-4 text-gray-500 dark:text-neutral-400 font-mono">
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                             </td>
                             <td className="p-4 text-right">
                                <button 
                                  onClick={() => { setEditingUser(user); setShowUserModal(true); }}
                                  className="text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs font-bold underline bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
                                >
                                  Edit
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* BRANCHES */}
        {view === 'BRANCHES' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Locations & Branches</h1>
                    <p className="text-gray-500 dark:text-neutral-400">Manage restaurant branches, kitchens, and warehouses.</p>
                 </div>
                 <button 
                   onClick={() => { setEditingBranch(null); setShowBranchModal(true); }}
                   className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20"
                 >
                    <Plus size={18} /> Add Branch
                 </button>
              </div>

              <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
                       <tr>
                          <th className="p-4">Branch Name</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Currency</th>
                          <th className="p-4">Tax Rate</th>
                          <th className="p-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                       {branches.map(branch => (
                          <tr key={branch.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                             <td className="p-4">
                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                   <Store size={16} className="text-gray-400 dark:text-neutral-500" />
                                   {branch.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-neutral-500 ml-6">ID: {branch.id}</div>
                             </td>
                             <td className="p-4">
                                <span className={`border px-2 py-1 rounded text-xs font-bold uppercase ${branch.type === 'STORE' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900' : branch.type === 'KITCHEN' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-500 border-orange-200 dark:border-orange-900' : 'bg-gray-200 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 border-gray-300 dark:border-neutral-700'}`}>
                                   {branch.type}
                                </span>
                             </td>
                             <td className="p-4 text-gray-900 dark:text-white font-mono font-bold">
                                {branch.currency}
                             </td>
                             <td className="p-4 text-gray-900 dark:text-white font-mono">
                                {branch.taxRate}%
                             </td>
                             <td className="p-4 text-right">
                                <button 
                                  onClick={() => { setEditingBranch(branch); setShowBranchModal(true); }}
                                  className="text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white text-xs font-bold underline bg-gray-100 dark:bg-neutral-800 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
                                >
                                  Edit
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

        {/* ROLES */}
        {view === 'ROLES' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Roles & Permissions</h1>
                 <p className="text-gray-500 dark:text-neutral-400">Configure access levels for different staff roles.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                 <div className="col-span-1 bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden flex flex-col shadow-sm">
                    <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 font-bold text-gray-900 dark:text-white">Roles</div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                       {roles.map(role => (
                          <button 
                             key={role.id}
                             onClick={() => setActiveRole(role.id)}
                             className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold flex justify-between items-center ${activeRole === role.id ? 'bg-gray-200 dark:bg-neutral-800 text-black dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800/50 hover:text-black dark:hover:text-white'}`}
                          >
                             {role.name}
                             {role.isSystem && <Lock size={12} className="text-gray-400 dark:text-neutral-600" />}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="col-span-3 bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-6 overflow-y-auto shadow-sm">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                       Permissions for <span className="text-brand-red">{roles.find(r => r.id === activeRole)?.name}</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                       {[
                         { id: 'POS_ACCESS', label: 'Access POS Terminal' },
                         { id: 'POS_VOID', label: 'Void Orders' },
                         { id: 'POS_DISCOUNT', label: 'Apply Discounts' },
                         { id: 'VIEW_DASHBOARD', label: 'View Analytics Dashboard' },
                         { id: 'MANAGE_INVENTORY', label: 'Manage Inventory & Stock' },
                         { id: 'MANAGE_STAFF', label: 'Manage Staff & Schedule' },
                         { id: 'VIEW_REPORTS', label: 'View Financial Reports' },
                         { id: 'SYSTEM_SETTINGS', label: 'Configure System Settings' },
                       ].map(perm => {
                          const role = roles.find(r => r.id === activeRole);
                          const hasPerm = role?.permissions.includes(perm.id as Permission);
                          return (
                             <div key={perm.id} className={`p-4 rounded-xl border flex items-center justify-between transition-colors ${hasPerm ? 'bg-gray-50 dark:bg-neutral-800/50 border-gray-300 dark:border-neutral-700' : 'bg-transparent border-gray-200 dark:border-neutral-800 opacity-70'}`}>
                                <span className="text-gray-900 dark:text-white font-medium text-sm">{perm.label}</span>
                                <Toggle 
                                  checked={!!hasPerm} 
                                  onChange={() => updateRolePermissions(activeRole, perm.id as Permission)} 
                                />
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* PRINTERS */}
        {view === 'PRINTERS' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Printers & Hardware</h1>
                    <p className="text-gray-500 dark:text-neutral-400">Manage connected receipt and kitchen printers.</p>
                 </div>
                 <button 
                   onClick={handleScanPrinters}
                   className="bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-neutral-700 border border-gray-300 dark:border-neutral-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"
                 >
                    {isScanningPrinters ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                    {isScanningPrinters ? 'Scanning...' : 'Scan for Devices'}
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {printers.map(printer => (
                    <div key={printer.id} className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-gray-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
                       <div className="flex justify-between items-start">
                          <div className={`p-3 rounded-xl ${printer.status === 'ONLINE' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : printer.status === 'OFFLINE' ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500'}`}>
                             {printer.status === 'ONLINE' ? <Wifi size={24} /> : printer.status === 'OFFLINE' ? <WifiOff size={24} /> : <FileWarning size={24} />}
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${printer.status === 'ONLINE' ? 'bg-green-100 dark:bg-green-900/10 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900' : printer.status === 'OFFLINE' ? 'bg-red-100 dark:bg-red-900/10 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900' : 'bg-yellow-100 dark:bg-yellow-900/10 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900'}`}>
                             {printer.status.replace('_', ' ')}
                          </span>
                       </div>
                       
                       <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{printer.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-neutral-400">{printer.location} • {printer.type}</p>
                       </div>

                       <div className="bg-gray-100 dark:bg-neutral-900 p-3 rounded-lg font-mono text-xs text-gray-500 dark:text-neutral-500 flex justify-between">
                          <span>IP Address</span>
                          <span className="text-gray-900 dark:text-white">{printer.ipAddress}</span>
                       </div>

                       <div className="flex gap-2 mt-2">
                          <button 
                            onClick={() => onNotify('Test Page Sent to Printer', 'success')}
                            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
                          >
                            Test Print
                          </button>
                          <button 
                            onClick={() => { setEditingPrinter(printer); setShowPrinterModal(true); }}
                            className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-400 text-xs font-bold hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
                          >
                            Config
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 <button 
                   onClick={() => { setEditingPrinter(null); setShowPrinterModal(true); }}
                   className="border-2 border-dashed border-gray-300 dark:border-neutral-800 rounded-xl flex flex-col items-center justify-center text-gray-400 dark:text-neutral-600 hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-neutral-600 transition-all min-h-[250px] bg-gray-50 dark:bg-transparent"
                 >
                    <Plus size={48} className="mb-4 opacity-50" />
                    <span className="font-bold">Add Manual Printer</span>
                 </button>
              </div>
           </div>
        )}

        {/* REPORTS & DATA */}
        {view === 'REPORTS' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">System Reports</h1>
                    <p className="text-gray-500 dark:text-neutral-400">Generate and export sales, inventory, and staff data.</p>
                 </div>
              </div>

              {/* Configuration Card */}
              <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-6 shadow-sm">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BarChart2 size={20} className="text-brand-red" /> Report Configuration
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Report Type</label>
                       <select 
                         value={reportType}
                         onChange={(e) => setReportType(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
                       >
                          <option value="SALES">Sales Performance</option>
                          <option value="INVENTORY">Inventory Usage</option>
                          <option value="LABOR">Labor Cost Analysis</option>
                          <option value="VOID">Void & Waste Log</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Time Period</label>
                       <select 
                         value={reportPeriod}
                         onChange={(e) => setReportPeriod(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
                       >
                          <option value="TODAY">Today</option>
                          <option value="THIS_WEEK">This Week</option>
                          <option value="THIS_MONTH">This Month</option>
                          <option value="LAST_QUARTER">Last Quarter</option>
                          <option value="YTD">Year to Date</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2 uppercase">Group By</label>
                       <select 
                         value={groupBy}
                         onChange={(e) => setGroupBy(e.target.value)}
                         className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none text-sm"
                       >
                          <option value="CATEGORY">Category</option>
                          <option value="DAY_OF_WEEK">Day of Week</option>
                          <option value="HOUR_OF_DAY">Hour of Day</option>
                          <option value="SERVER">Server</option>
                       </select>
                    </div>
                    <div className="flex items-end">
                       <button 
                         onClick={handleGenerateReport}
                         disabled={isGenerating}
                         className={`w-full py-3 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-neutral-200 text-white dark:text-black font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${isGenerating ? 'opacity-70 cursor-not-allowed' : ''}`}
                       >
                          {isGenerating ? <Loader2 size={18} className="animate-spin"/> : <BarChart2 size={18} />}
                          {isGenerating ? 'Generating...' : 'Generate Report'}
                       </button>
                    </div>
                 </div>
                 
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-800 flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className="w-4 h-4 rounded border border-gray-400 dark:border-neutral-600 bg-brand-red flex items-center justify-center text-white"><Check size={12}/></div>
                       <span className="text-sm text-gray-700 dark:text-neutral-300">Revenue</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className="w-4 h-4 rounded border border-gray-400 dark:border-neutral-600 bg-brand-red flex items-center justify-center text-white"><Check size={12}/></div>
                       <span className="text-sm text-gray-700 dark:text-neutral-300">Profit Margin %</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                       <div className="w-4 h-4 rounded border border-gray-400 dark:border-neutral-600 bg-brand-red flex items-center justify-center text-white"><Check size={12}/></div>
                       <span className="text-sm text-gray-700 dark:text-neutral-300">Avg Order Value</span>
                    </label>
                 </div>
              </div>

              {/* Report Output */}
              {reportResult && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-between items-center">
                       <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                         {reportType.charAt(0).toUpperCase() + reportType.slice(1).toLowerCase()} Report: {reportPeriod.replace('_', ' ')}
                       </h3>
                       <button 
                         onClick={handleExportCSV}
                         className="text-sm text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-2 border border-gray-300 dark:border-neutral-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                       >
                          <Download size={16} /> Export CSV
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">{reportResult.summary.label1}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{reportResult.summary.value1}</div>
                       </div>
                       <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">{reportResult.summary.label2}</div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-500 mt-1">{reportResult.summary.value2}</div>
                       </div>
                       <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">{reportResult.summary.label3}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{reportResult.summary.value3}</div>
                       </div>
                       <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 p-4 rounded-xl shadow-sm">
                          <div className="text-xs text-gray-500 dark:text-neutral-500 uppercase font-bold">{reportResult.summary.label4}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{reportResult.summary.value4}</div>
                       </div>
                    </div>

                    <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-6 h-96 shadow-sm">
                       <h4 className="text-sm font-bold text-gray-500 dark:text-neutral-400 mb-6 flex justify-between">
                         <span>Analysis by {groupBy.replace(/_/g, ' ')}</span>
                         <span className="text-xs text-gray-400 dark:text-neutral-500 font-normal">Generated on {new Date().toLocaleTimeString()}</span>
                       </h4>
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={reportResult.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} vertical={false} />
                             <XAxis dataKey="name" stroke={theme === 'dark' ? '#666' : '#9ca3af'} tick={{fill: theme === 'dark' ? '#999' : '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                             <YAxis yAxisId="left" orientation="left" stroke={theme === 'dark' ? '#666' : '#9ca3af'} tick={{fill: theme === 'dark' ? '#999' : '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                             <YAxis yAxisId="right" orientation="right" stroke={theme === 'dark' ? '#666' : '#9ca3af'} tick={{fill: theme === 'dark' ? '#999' : '#6b7280', fontSize: 12}} tickLine={false} axisLine={false} />
                             <Tooltip 
                               cursor={{fill: theme === 'dark' ? '#222' : '#f3f4f6'}} 
                               contentStyle={{backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px'}} 
                               itemStyle={{color: theme === 'dark' ? '#fff' : '#000'}} 
                             />
                             <Legend wrapperStyle={{ color: theme === 'dark' ? '#999' : '#6b7280' }} />
                             <Bar yAxisId="left" dataKey={reportResult.chartConfig.bar1} name={reportResult.chartConfig.name1} fill={reportResult.chartConfig.color1} radius={[4, 4, 0, 0]} />
                             <Bar yAxisId="right" dataKey={reportResult.chartConfig.bar2} name={reportResult.chartConfig.name2} fill={reportResult.chartConfig.color2} radius={[4, 4, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              )}
           </div>
        )}

        {/* AUDIT LOGS */}
        {view === 'AUDIT' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">System Audit Logs</h1>
                    <p className="text-gray-500 dark:text-neutral-400">Track sensitive actions and security events.</p>
                 </div>
                 <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
                    <input 
                      type="text" 
                      placeholder="Search logs..." 
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-900 dark:text-white focus:border-brand-red outline-none w-64"
                    />
                 </div>
              </div>

              <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
                       <tr>
                          <th className="p-4">Time</th>
                          <th className="p-4">User</th>
                          <th className="p-4">Module</th>
                          <th className="p-4">Action</th>
                          <th className="p-4">Details</th>
                          <th className="p-4 text-center">Severity</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                       {filteredAuditLogs.length > 0 ? filteredAuditLogs.map(log => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors">
                             <td className="p-4 text-gray-500 dark:text-neutral-500 font-mono text-xs">
                                {log.timestamp.toLocaleString()}
                             </td>
                             <td className="p-4 text-gray-900 dark:text-white font-bold">{log.user}</td>
                             <td className="p-4">
                                <span className="bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 px-2 py-1 rounded text-[10px] font-bold text-gray-600 dark:text-neutral-300 uppercase">{log.module}</span>
                             </td>
                             <td className="p-4 text-gray-900 dark:text-white">{log.action}</td>
                             <td className="p-4 text-gray-600 dark:text-neutral-400 max-w-md truncate">{log.details}</td>
                             <td className="p-4 text-center">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase ${log.severity === 'CRITICAL' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 border-red-200 dark:border-red-900' : log.severity === 'WARNING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 border-blue-200 dark:border-blue-900'}`}>
                                   {log.severity}
                                </span>
                             </td>
                          </tr>
                       )) : (
                         <tr>
                           <td colSpan={6} className="p-8 text-center text-gray-500 dark:text-neutral-500 italic">
                             No logs found matching "{auditSearch}"
                           </td>
                         </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        )}

      </div>
    </div>
  );
};
