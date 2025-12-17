
import React, { useState } from 'react';
import { CUSTOMERS, CAMPAIGNS } from '../constants';
import { Campaign, Customer } from '../types';
import { 
  Users, Megaphone, Trophy, Star, TrendingUp, Search, Plus, 
  Mail, MessageSquare, Bell, Calendar, DollarSign, Filter,
  MoreVertical, CheckCircle, Smartphone, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';

type ViewMode = 'OVERVIEW' | 'CAMPAIGNS' | 'CUSTOMERS' | 'LOYALTY';

// --- SUB-COMPONENTS ---

const RedemptionRulesModal = ({ 
  currentRule, 
  onClose, 
  onSave 
}: { 
  currentRule: { points: number, value: number }; 
  onClose: () => void; 
  onSave: (points: number, value: number) => void; 
}) => {
  const [points, setPoints] = useState(currentRule.points.toString());
  const [value, setValue] = useState(currentRule.value.toString());

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-xl border border-gray-200 dark:border-neutral-700 shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Star className="text-brand-red" /> Redemption Rules
          </h3>
          <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white" /></button>
        </div>
        
        <div className="space-y-6">
           <div className="bg-gray-100 dark:bg-neutral-900/50 p-4 rounded-lg border border-gray-200 dark:border-neutral-800 text-sm text-gray-600 dark:text-neutral-400">
              Define the conversion rate for loyalty points to currency discounts.
           </div>

           <div className="flex items-center gap-4">
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Points Required</label>
                 <input 
                   type="number" 
                   value={points}
                   onChange={(e) => setPoints(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-bold text-center"
                 />
              </div>
              <div className="text-center font-bold text-gray-400 dark:text-neutral-600 pt-6">=</div>
              <div className="flex-1">
                 <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Discount Value (KWD)</label>
                 <input 
                   type="number" 
                   value={value}
                   onChange={(e) => setValue(e.target.value)}
                   className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none font-bold text-center"
                 />
              </div>
           </div>

           <button 
             onClick={() => onSave(Number(points), Number(value))}
             className="w-full py-3 bg-brand-red hover:bg-brand-redHover text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20"
           >
             Save Configuration
           </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; trend: string; isPositive: boolean; icon: React.ReactNode }> = ({ label, value, trend, isPositive, icon }) => (
  <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-col justify-between shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400">{icon}</div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500'}`}>
        {trend}
      </span>
    </div>
    <div>
      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-gray-500 dark:text-neutral-500 text-sm">{label}</p>
    </div>
  </div>
);

const CampaignCard: React.FC<{ campaign: Campaign }> = ({ campaign }) => {
  const statusColors = {
    DRAFT: 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-gray-200 dark:border-transparent',
    SCHEDULED: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900',
    ACTIVE: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-500 border border-green-200 dark:border-green-900',
    COMPLETED: 'bg-gray-800 dark:bg-neutral-800 text-white border border-gray-700 dark:border-neutral-700'
  };

  const TypeIcon = {
    SMS: MessageSquare,
    EMAIL: Mail,
    PUSH: Bell
  }[campaign.type];

  return (
    <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-neutral-600 transition-all group shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gray-100 dark:bg-neutral-900 rounded-full flex items-center justify-center text-gray-600 dark:text-white border border-gray-200 dark:border-neutral-800">
            <TypeIcon size={18} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{campaign.name}</h4>
            <div className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">{campaign.startDate.toLocaleDateString()}</div>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[campaign.status]}`}>
          {campaign.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-100 dark:border-neutral-800/50 mb-4">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-neutral-500 mb-1">Sent</div>
          <div className="font-mono font-bold text-gray-900 dark:text-white">{campaign.sentCount.toLocaleString()}</div>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-neutral-800">
          <div className="text-xs text-gray-500 dark:text-neutral-500 mb-1">Open Rate</div>
          <div className="font-mono font-bold text-brand-red">{campaign.engagementRate}%</div>
        </div>
        <div className="text-center border-l border-gray-200 dark:border-neutral-800">
          <div className="text-xs text-gray-500 dark:text-neutral-500 mb-1">Revenue</div>
          <div className="font-mono font-bold text-green-600 dark:text-green-500">{campaign.revenueGenerated} KWD</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex -space-x-2">
          {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-gray-300 dark:bg-neutral-700 border border-white dark:border-brand-surface"></div>)}
        </div>
        <button className="text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">View Report</button>
      </div>
    </div>
  );
};

const CreateCampaignModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="bg-white dark:bg-brand-surface w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl flex flex-col h-[600px]">
      <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-900">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
        <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white font-bold">Close</button>
      </div>
      
      <div className="flex-1 p-8 grid grid-cols-2 gap-8 overflow-y-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Campaign Name</label>
            <input type="text" className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none" placeholder="e.g., Summer Promo" />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Channel</label>
            <div className="grid grid-cols-3 gap-3">
              {['SMS', 'Email', 'Push'].map(c => (
                <button key={c} className="p-3 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-gray-900 dark:text-white hover:border-brand-red focus:bg-brand-red focus:text-white focus:border-brand-red transition-all font-bold text-sm">
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Target Audience</label>
             <select className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none">
                <option>All Customers (2,450)</option>
                <option>VIP Segment (Top 10%)</option>
                <option>Lost Customers (>60 days inactive)</option>
             </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Schedule</label>
            <div className="flex gap-3">
              <input type="date" className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white" />
              <input type="time" className="flex-1 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-100 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 p-6 flex flex-col items-center justify-center relative">
           <div className="absolute top-4 left-4 text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-widest">Preview</div>
           {/* Mobile Preview Mockup */}
           <div className="w-64 h-96 bg-black rounded-3xl border-4 border-gray-800 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
              <div className="h-6 bg-neutral-900 flex justify-center items-center gap-1">
                <div className="w-16 h-3 bg-black rounded-full"></div>
              </div>
              <div className="flex-1 bg-neutral-800 p-4 flex flex-col gap-2">
                 <div className="self-start bg-neutral-700 rounded-lg rounded-tl-none p-3 max-w-[80%]">
                    <div className="h-2 w-20 bg-neutral-600 rounded mb-2"></div>
                    <div className="h-2 w-32 bg-neutral-600 rounded"></div>
                 </div>
                 <div className="self-end bg-blue-600 rounded-lg rounded-tr-none p-3 max-w-[80%]">
                    <div className="text-[10px] text-white">Hey Fahad! 🌮 It's Taco Tuesday. Show this text for 20% off your order! Valid today only.</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
        <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800">Save Draft</button>
        <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20">Launch Campaign</button>
      </div>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const Marketing: React.FC = () => {
  const { theme } = useApp();
  const [view, setView] = useState<ViewMode>('OVERVIEW');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Rules State
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [redemptionRule, setRedemptionRule] = useState({ points: 100, value: 1.0 });

  const totalCustomers = CUSTOMERS.length + 2450; // Mock total
  const activeCampaigns = CAMPAIGNS.filter(c => c.status === 'ACTIVE').length;

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 flex flex-col space-y-6 overflow-y-auto relative">
      {showCreateModal && <CreateCampaignModal onClose={() => setShowCreateModal(false)} />}
      
      {showRulesModal && (
        <RedemptionRulesModal 
          currentRule={redemptionRule}
          onClose={() => setShowRulesModal(false)}
          onSave={(p, v) => {
            setRedemptionRule({ points: p, value: v });
            setShowRulesModal(false);
          }}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <Megaphone className="text-brand-red" /> Marketing & CRM
           </h1>
           <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Acquire, retain, and reward your customers.</p>
        </div>
        
        <div className="flex bg-gray-200 dark:bg-neutral-900 p-1 rounded-lg border border-gray-300 dark:border-neutral-800">
           <button onClick={() => setView('OVERVIEW')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'OVERVIEW' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}><TrendingUp size={16}/> Overview</button>
           <button onClick={() => setView('CAMPAIGNS')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'CAMPAIGNS' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}><Megaphone size={16}/> Campaigns</button>
           <button onClick={() => setView('CUSTOMERS')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'CUSTOMERS' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}><Users size={16}/> Customers</button>
           <button onClick={() => setView('LOYALTY')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'LOYALTY' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}><Trophy size={16}/> Loyalty</button>
        </div>
      </div>

      {view === 'OVERVIEW' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Customers" value={totalCustomers.toLocaleString()} trend="+12% vs last mo" isPositive={true} icon={<Users size={20} />} />
            <StatCard label="Active Campaigns" value={activeCampaigns.toString()} trend="2 Ending Soon" isPositive={true} icon={<Megaphone size={20} />} />
            <StatCard label="ROI (Last 30d)" value="450%" trend="+5% Efficiency" isPositive={true} icon={<DollarSign size={20} />} />
            <StatCard label="Email Open Rate" value="24.8%" trend="-1.2% Decrease" isPositive={false} icon={<Mail size={20} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Campaign Performance (Revenue)</h3>
               <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Mon', revenue: 400 },
                      { name: 'Tue', revenue: 300 },
                      { name: 'Wed', revenue: 550 },
                      { name: 'Thu', revenue: 450 },
                      { name: 'Fri', revenue: 800 },
                      { name: 'Sat', revenue: 950 },
                      { name: 'Sun', revenue: 600 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} vertical={false} />
                      <XAxis dataKey="name" stroke={theme === 'dark' ? '#666' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={theme === 'dark' ? '#666' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} KD`} />
                      <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} cursor={{fill: theme === 'dark' ? '#333' : '#f3f4f6'}} />
                      <Bar dataKey="revenue" fill="#EF4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Campaigns</h3>
                 <button className="text-brand-red text-xs font-bold hover:underline">View All</button>
               </div>
               <div className="space-y-4">
                  {CAMPAIGNS.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-neutral-900/50 rounded-lg border border-gray-200 dark:border-neutral-800">
                       <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gray-200 dark:bg-neutral-800 rounded-full flex items-center justify-center text-xs text-gray-500 dark:text-neutral-400">
                             {c.type === 'SMS' ? <MessageSquare size={14} /> : <Mail size={14} />}
                          </div>
                          <div>
                             <div className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</div>
                             <div className="text-xs text-gray-500 dark:text-neutral-500">{c.startDate.toLocaleDateString()}</div>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="font-mono font-bold text-green-600 dark:text-green-500 text-sm">{c.revenueGenerated} KWD</div>
                          <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase tracking-wide">Revenue</div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      )}

      {view === 'CAMPAIGNS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="relative w-64">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
                <input type="text" placeholder="Search campaigns..." className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-10 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-brand-red" />
             </div>
             <button onClick={() => setShowCreateModal(true)} className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20">
               <Plus size={18} /> Create Campaign
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {CAMPAIGNS.map(c => <CampaignCard key={c.id} campaign={c} />)}
          </div>
        </div>
      )}

      {view === 'CUSTOMERS' && (
        <div className="space-y-4">
           <div className="flex gap-2 mb-4">
             <button className="px-4 py-2 bg-gray-800 dark:bg-neutral-800 text-white rounded-lg text-sm border border-gray-600 dark:border-neutral-600 font-medium">All Customers</button>
             <button className="px-4 py-2 bg-white dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-lg text-sm border border-gray-300 dark:border-neutral-800 font-medium">VIPs</button>
             <button className="px-4 py-2 bg-white dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded-lg text-sm border border-gray-300 dark:border-neutral-800 font-medium">Churn Risk</button>
           </div>
           
           <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Segments</th>
                  <th className="p-4 text-right">Visits</th>
                  <th className="p-4 text-right">Total Spend</th>
                  <th className="p-4 text-right">Points</th>
                  <th className="p-4">Last Visit</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {CUSTOMERS.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-gray-700 dark:text-neutral-300 group">
                    <td className="p-4">
                       <div className="font-bold text-gray-900 dark:text-white">{c.name}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">ID: {c.id}</div>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2 text-xs"><Smartphone size={12} /> {c.phone}</div>
                       <div className="flex items-center gap-2 text-xs mt-1"><Mail size={12} /> {c.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded border bg-gray-100 dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-neutral-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">{c.visitCount}</td>
                    <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-white">{c.totalSpend.toFixed(3)}</td>
                    <td className="p-4 text-right font-mono text-yellow-600 dark:text-yellow-500">{c.loyaltyPoints}</td>
                    <td className="p-4 text-gray-500 dark:text-neutral-500">{c.lastVisit.toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                       <button className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><MoreVertical size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
           </div>
        </div>
      )}

      {view === 'LOYALTY' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loyalty Tiers</h3>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Configure point multipliers and rewards.</p>
                 </div>
                 <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-900">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-600 dark:text-green-500 uppercase">Program Active</span>
                 </div>
              </div>

              <div className="space-y-4">
                 {[{name: 'Bronze', color: 'text-orange-500 dark:text-orange-400', min: 0, mult: '1x'}, {name: 'Silver', color: 'text-gray-500 dark:text-gray-300', min: 1000, mult: '1.25x'}, {name: 'Gold', color: 'text-yellow-500 dark:text-yellow-400', min: 5000, mult: '1.5x'}].map(tier => (
                   <div key={tier.name} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-900/50 rounded-xl border border-gray-200 dark:border-neutral-800">
                      <div className="flex items-center gap-4">
                         <div className={`h-12 w-12 rounded-full border-2 bg-gray-100 dark:bg-neutral-800 flex items-center justify-center ${tier.color} border-current`}>
                           <Trophy size={20} className="fill-current" />
                         </div>
                         <div>
                            <div className={`font-bold text-lg ${tier.color}`}>{tier.name}</div>
                            <div className="text-xs text-gray-500 dark:text-neutral-500">Min. {tier.min} Points</div>
                         </div>
                      </div>
                      <div className="text-right">
                         <div className="font-bold text-gray-900 dark:text-white">{tier.mult} Points</div>
                         <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase">Multiplier</div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 flex flex-col justify-center items-center text-center shadow-sm">
              <Star size={64} className="text-gray-300 dark:text-neutral-700 mb-6" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Redemption Rules</h3>
              <p className="text-gray-500 dark:text-neutral-400 max-w-sm mt-2">
                Set up how customers can spend their points. Current rule: <strong>{redemptionRule.points} Points = {redemptionRule.value.toFixed(3)} KWD</strong> Discount.
              </p>
              <button 
                onClick={() => setShowRulesModal(true)}
                className="mt-6 px-6 py-2 bg-gray-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white rounded-lg font-bold border border-transparent dark:border-neutral-700 shadow-lg"
              >
                Configure Rules
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
