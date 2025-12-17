
import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Legend, PieChart, Pie, Cell } from 'recharts';
import { ALERTS, AI_RECOMMENDATIONS, BRANCHES, MENU_ITEMS } from '../constants';
import { AICategory, AIRecommendation, Module, Branch } from '../types';
import { AlertTriangle, TrendingUp, DollarSign, Users, ArrowUpRight, ArrowDownRight, Brain, CheckCircle, XCircle, ChevronRight, Activity, MapPin, Calendar, Filter, ChevronDown, Utensils, Coffee, ShoppingBag, Check, Search, X, Info, FileText, Phone, Truck, Target, Wallet, PieChart as PieIcon, Clock, Zap, ShieldAlert, Bike, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Enhanced Mock Data Generator
const generateChartData = (
  period: string, 
  location: string, 
  category: string, 
  itemId: string,
  customStart: string,
  customEnd: string,
  specificMonth: string
) => {
  // Base scales
  let scale = 1;
  
  // Location scaling
  if (location === 'ALL') scale *= 4.2; // Simulating multiple branches
  
  // Category scaling (Food usually higher revenue than Bev)
  if (category === 'FOOD') scale *= 0.75;
  if (category === 'BEVERAGE') scale *= 0.25;

  // Item scaling (Single item vs Category)
  if (itemId !== 'ALL') {
    // If a specific item is selected, it's a fraction of the category
    // We'll give it a somewhat random popularity factor based on ID char code for consistency
    const popularity = (itemId.charCodeAt(itemId.length - 1) % 5) + 1; // 1 to 5
    scale *= (0.05 * popularity); 
  }

  // Randomizer helper to make charts look dynamic but consistent
  const getVal = (base: number) => Math.floor(base * scale * (0.9 + Math.random() * 0.2));

  if (period === 'TODAY') {
    return [
      { name: '10am', sales: getVal(40), target: getVal(20) },
      { name: '12pm', sales: getVal(300), target: getVal(250) },
      { name: '2pm', sales: getVal(500), target: getVal(450) },
      { name: '4pm', sales: getVal(200), target: getVal(300) },
      { name: '6pm', sales: getVal(450), target: getVal(400) },
      { name: '8pm', sales: getVal(700), target: getVal(600) },
      { name: '10pm', sales: getVal(550), target: getVal(500) },
    ];
  } else if (period === 'WEEK') {
    // Daily bases
    return [
      { name: 'Mon', sales: getVal(1200), target: getVal(1100) },
      { name: 'Tue', sales: getVal(1400), target: getVal(1300) },
      { name: 'Wed', sales: getVal(1100), target: getVal(1200) },
      { name: 'Thu', sales: getVal(1600), target: getVal(1500) },
      { name: 'Fri', sales: getVal(2200), target: getVal(2000) },
      { name: 'Sat', sales: getVal(2400), target: getVal(2200) },
      { name: 'Sun', sales: getVal(1800), target: getVal(1700) },
    ];
  } else if (period === 'CUSTOM') {
     if (!customStart || !customEnd) {
        // Fallback if no dates selected yet
        return Array.from({ length: 7 }, (_, i) => ({
          name: `Day ${i + 1}`,
          sales: getVal(1300),
          target: getVal(1200),
        }));
     }

     const start = new Date(customStart);
     const end = new Date(customEnd);
     const diffTime = Math.abs(end.getTime() - start.getTime());
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
     const daysToRender = diffDays > 0 ? diffDays : 1;

     return Array.from({ length: daysToRender }, (_, i) => {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        return {
          name: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          sales: getVal(1300),
          target: getVal(1200),
        };
     });

  } else if (period === 'MONTH_PICKER') {
    const [year, month] = specificMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => ({
      name: `${i + 1}`,
      sales: getVal(1500),
      target: getVal(1400),
    }));
  } else {
    // 30 Days default
    return Array.from({ length: 30 }, (_, i) => ({
      name: `${i + 1}`,
      sales: getVal(1500),
      target: getVal(1400),
    }));
  }
};

const mixData = [
  { name: 'Machboos', x: 80, y: 140, z: 200, type: 'Star' }, 
  { name: 'Biryani', x: 70, y: 90, z: 240, type: 'Plowhorse' }, 
  { name: 'Hummus', x: 30, y: 160, z: 100, type: 'Puzzle' }, 
  { name: 'Umm Ali', x: 20, y: 40, z: 50, type: 'Dog' }, 
];

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, trend, isPositive, icon }) => (
  <div className="bg-white dark:bg-brand-surface p-5 rounded-xl border border-gray-200 dark:border-neutral-700 hover:border-brand-red/50 dark:hover:border-brand-red/50 transition-all group shadow-sm">
    <div className="flex justify-between items-start mb-3">
      <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400 group-hover:text-brand-red transition-colors">{icon}</div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1 ${isPositive ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
        {trend}
      </span>
    </div>
    <div className="text-gray-500 dark:text-neutral-400 text-sm font-medium">{title}</div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</div>
  </div>
);

// Component: Financial Pulse & Milestone
const FinancialPulse: React.FC<{ currency: string }> = ({ currency }) => {
  const today = { sales: 1450.500, expenses: 420.250, net: 1030.250 };
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  
  const [simulatedDay, setSimulatedDay] = useState(currentDay);
  
  const monthTarget = 40000;
  const ACTUAL_REVENUE_TODAY = 28500;
  
  // Calculate revenue based on the slider position
  // Logic: Calculate average revenue per day based on ACTUAL, then multiply by simulated day
  const dailyAverage = ACTUAL_REVENUE_TODAY / Math.max(1, currentDay);
  const displayedRevenue = Math.floor(dailyAverage * simulatedDay);

  const rawProgressPercent = (displayedRevenue / monthTarget) * 100;
  const timeElapsedPercent = (simulatedDay / daysInMonth) * 100;
  const todayPercent = (currentDay / daysInMonth) * 100;
  
  const isAhead = rawProgressPercent >= timeElapsedPercent;
  const isToday = simulatedDay === currentDay;

  // Cap the visual bar at the time slider position (user requirement)
  const visualProgressPercent = Math.min(rawProgressPercent, timeElapsedPercent);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Daily Snapshot */}
      <div className="lg:col-span-2 bg-gray-100 dark:bg-neutral-900/50 border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-white dark:bg-brand-surface rounded-lg text-gray-900 dark:text-white border border-gray-200 dark:border-neutral-700">
               <Activity size={20} className="text-brand-red" />
            </div>
            <div>
               <div className="text-xs text-gray-500 dark:text-neutral-500 font-bold uppercase tracking-wider">Today's Pulse</div>
               <div className="text-sm text-gray-700 dark:text-neutral-300">Live P&L Snapshot</div>
            </div>
         </div>

         <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-start">
            <div>
               <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase font-bold mb-1">Gross Sales</div>
               <div className="text-lg font-bold text-gray-900 dark:text-white">{today.sales.toFixed(3)} <span className="text-xs text-gray-500 dark:text-neutral-500">{currency}</span></div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-neutral-800"></div>
            <div>
               <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase font-bold mb-1">Expenses</div>
               <div className="text-lg font-bold text-red-500 dark:text-red-400">-{today.expenses.toFixed(3)}</div>
            </div>
            <div className="h-8 w-px bg-gray-300 dark:bg-neutral-800"></div>
            <div>
               <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase font-bold mb-1">Net Profit</div>
               <div className="text-lg font-bold text-green-600 dark:text-green-500">+{today.net.toFixed(3)}</div>
            </div>
         </div>
      </div>

      {/* Monthly Milestone */}
      <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-center relative overflow-hidden group shadow-sm">
         <div className="absolute right-0 bottom-0 opacity-10">
            <TrendingUp size={64} className={isAhead ? "text-green-500" : "text-yellow-500"} />
         </div>

         <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
               <div className="text-xs text-gray-500 dark:text-neutral-400 font-bold uppercase flex items-center gap-1">
                  Monthly Goal <Target size={12}/>
               </div>
               <div className={`text-xl font-bold mt-1 transition-colors ${!isToday ? 'text-brand-red' : 'text-gray-900 dark:text-white'}`}>
                  {displayedRevenue.toLocaleString()} <span className="text-xs text-gray-500 dark:text-neutral-500 font-normal">/ {monthTarget.toLocaleString()} {currency}</span>
               </div>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded border transition-colors duration-300 ${isAhead ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500 border-green-200 dark:border-green-900' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500 border-yellow-200 dark:border-yellow-900'}`}>
               {isAhead ? 'On Track' : 'Behind Pace'}
            </div>
         </div>

         <div className="relative h-6 mt-1">
            {/* Track Background */}
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
               {/* Progress Bar */}
               <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-300 ${isAhead ? 'bg-brand-red' : 'bg-yellow-500'}`} 
                  style={{ width: `${visualProgressPercent}%` }}
               ></div>
            </div>

            {/* Today Marker (Reference) */}
            {!isToday && (
               <div 
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-400/50 dark:bg-neutral-600 z-10"
                  style={{ left: `${todayPercent}%` }}
                  title="Current Day"
               ></div>
            )}

            {/* Range Input (Invisible Interaction Layer) */}
            <input 
               type="range" 
               min="1" 
               max={daysInMonth}
               step="1" 
               value={simulatedDay}
               onChange={(e) => setSimulatedDay(Number(e.target.value))}
               className="absolute top-1/2 -translate-y-1/2 w-full opacity-0 z-30 cursor-ew-resize h-6"
            />

            {/* Draggable Cursor Indicator */}
            <div 
               className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)] z-20 pointer-events-none transition-all duration-75 ease-out border-2 flex items-center justify-center ${!isToday ? 'bg-brand-red border-white' : 'bg-white border-gray-200 dark:border-neutral-700'}`}
               style={{ left: `calc(${timeElapsedPercent}% - 8px)` }}
            >
               <div className={`w-1.5 h-1.5 rounded-full ${!isToday ? 'bg-white' : 'bg-brand-red'}`}></div>
            </div>
         </div>

         <div className="flex justify-between mt-1 text-[10px] text-gray-500 dark:text-neutral-500 font-mono relative z-10">
            <span>Day 1</span>
            <span className={`transition-colors font-bold ${!isToday ? 'text-brand-red' : 'text-gray-400 dark:text-neutral-300'}`}>
               {isToday ? 'Today' : `Day ${simulatedDay}`}
            </span>
            <span>Day {daysInMonth}</span>
         </div>
      </div>
    </div>
  );
};

// Component: Operational Velocity Indicators
const OperationsVelocity: React.FC = () => {
  const metrics = [
    { label: 'Kitchen Pace', value: '14m', target: '12m', status: 'WARNING', icon: Clock, desc: 'Avg Ticket Time' },
    { label: 'Labor Efficiency', value: '42 KD', target: '50 KD', status: 'LOW', icon: Users, desc: 'Sales / Labor Hr' },
    { label: 'Delivery Perf.', value: '92%', target: '95%', status: 'GOOD', icon: Truck, desc: 'On-Time Rate' },
    { label: 'Void Rate', value: '1.2%', target: '< 2%', status: 'GOOD', icon: ShieldAlert, desc: 'Security Check' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const isGood = m.status === 'GOOD';
        const isWarn = m.status === 'WARNING';
        
        return (
          <div key={idx} className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-400 dark:hover:border-neutral-600 transition-colors shadow-sm">
             <div className="flex justify-between items-start mb-2">
                <div className="flex flex-col">
                   <span className="text-xs text-gray-500 dark:text-neutral-500 font-bold uppercase">{m.label}</span>
                   <span className="text-[10px] text-gray-400 dark:text-neutral-600">{m.desc}</span>
                </div>
                <m.icon size={16} className={isGood ? 'text-green-500' : isWarn ? 'text-yellow-500' : 'text-red-500'} />
             </div>
             
             <div className="mt-2">
                <div className="flex items-end gap-2">
                   <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{m.value}</span>
                   <span className="text-xs text-gray-500 dark:text-neutral-500 mb-0.5">/ {m.target}</span>
                </div>
                
                <div className="h-1.5 w-full bg-gray-200 dark:bg-neutral-800 rounded-full mt-2 overflow-hidden">
                   <div 
                     className={`h-full rounded-full ${isGood ? 'bg-green-500' : isWarn ? 'bg-yellow-500' : 'bg-red-500'}`}
                     style={{ width: isGood ? '92%' : '70%' }}
                   ></div>
                </div>
             </div>
          </div>
        )
      })}
    </div>
  );
};

// Component: Channel Revenue Breakdown
const ChannelMix: React.FC<{ currency: string }> = ({ currency }) => {
  const { theme } = useApp();
  const BASE_DATA = [
    { name: 'Dine-In', value: 8500, color: '#EF4444', icon: Utensils }, 
    { name: 'Takeaway', value: 3200, color: '#737373', icon: ShoppingBag },
    { name: 'Talabat', value: 6800, color: '#F97316', icon: Bike },
    { name: 'Deliveroo', value: 5100, color: '#2DD4BF', icon: Bike },
    { name: 'Jahez', value: 2400, color: '#A855F7', icon: Bike },
    { name: 'Keeta', value: 2500, color: '#3B82F6', icon: Bike },
  ];

  const [activeChannels, setActiveChannels] = useState<string[]>(BASE_DATA.map(d => d.name));

  const toggleChannel = (name: string) => {
    setActiveChannels(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
  };

  const chartData = BASE_DATA.filter(d => activeChannels.includes(d.name));
  const totalVisibleRevenue = chartData.reduce((acc, curr) => acc + curr.value, 0);
  const totalPotentialRevenue = BASE_DATA.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white dark:bg-brand-surface p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 flex flex-col h-full overflow-hidden shadow-sm">
      <div className="flex justify-between items-start mb-6">
         <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <Bike size={18} className="text-brand-red" /> Channel Breakdown
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">Revenue distribution by source</p>
         </div>
         <div className="text-right bg-gray-100 dark:bg-neutral-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800">
            <div className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase font-bold">Total Selected</div>
            <div className="text-lg font-bold text-gray-900 dark:text-white leading-none mt-0.5">{totalVisibleRevenue.toLocaleString()} <span className="text-xs text-gray-500 dark:text-neutral-500 font-normal">{currency}</span></div>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center h-full">
         <div className="relative w-48 h-48 xl:w-56 xl:h-56 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius="60%"
                    outerRadius="80%"
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={4}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px', padding: '8px 12px' }}
                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number) => `${value.toLocaleString()} ${currency}`}
                    labelStyle={{ display: 'none' }}
                  />
               </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-bold text-gray-900 dark:text-white">{activeChannels.length}</span>
               <span className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase font-bold tracking-wide">Active</span>
            </div>
         </div>

         <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-1">
            {BASE_DATA.map(channel => {
               const isActive = activeChannels.includes(channel.name);
               const percent = totalVisibleRevenue > 0 && isActive 
                  ? ((channel.value / totalVisibleRevenue) * 100).toFixed(1) 
                  : '0.0';
               
               return (
                  <button 
                    key={channel.name}
                    onClick={() => toggleChannel(channel.name)}
                    className={`relative overflow-hidden flex items-center justify-between p-3 rounded-xl border transition-all duration-200 group ${
                        isActive 
                        ? 'bg-gray-50 dark:bg-neutral-800/50 border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 shadow-sm' 
                        : 'bg-transparent border-dashed border-gray-300 dark:border-neutral-800 opacity-60 hover:opacity-100 hover:border-gray-400 dark:hover:border-neutral-600'
                    }`}
                  >
                     {isActive && (
                        <div 
                           className="absolute bottom-0 left-0 h-0.5 transition-all duration-500" 
                           style={{ width: `${percent}%`, backgroundColor: channel.color }}
                        ></div>
                     )}

                     <div className="flex items-center gap-3">
                        <div 
                           className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                              isActive ? 'text-white' : 'text-gray-400 dark:text-neutral-500 bg-gray-200 dark:bg-neutral-900'
                           }`}
                           style={{ backgroundColor: isActive ? channel.color : undefined }}
                        >
                           <channel.icon size={18} />
                        </div>
                        <div className="text-left">
                           <div className={`text-xs font-bold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400'}`}>
                              {channel.name}
                           </div>
                           <div className="text-[10px] text-gray-500 dark:text-neutral-500 font-mono">
                              {channel.value.toLocaleString()}
                           </div>
                        </div>
                     </div>

                     <div className="text-right">
                        <div className={`text-lg font-bold transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-600'}`}>
                           {percent}<span className="text-[10px] align-top">%</span>
                        </div>
                     </div>
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  );
};

const RiskBadge: React.FC<{ level: string }> = ({ level }) => {
  const colors = {
    LOW: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    MEDIUM: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900',
    HIGH: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900',
  };
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors[level as keyof typeof colors]}`}>
      RISK: {level}
    </span>
  );
};

const AlertDetailsModal = ({ alert, onClose }: { alert: any, onClose: () => void }) => {
  let details = {
    analysis: 'System has detected an anomaly based on historical patterns.',
    recommendation: 'Review the details and take necessary action.',
    actionLabel: 'Go to Module',
    secondaryInfo: 'Report ID: OP-' + Math.floor(Math.random() * 10000)
  };

  if (alert.module === 'INVENTORY') {
    details = {
      analysis: 'Current stock level (12kg) is significantly below the par level of 15kg. Based on average daily consumption (3.5kg), you will run out in approx. 3 days.',
      recommendation: 'Initiate an urgent purchase order to "Kuwait Agriculture Co." to avoid stockout during the weekend rush.',
      actionLabel: 'Create Purchase Order',
      secondaryInfo: 'Lead Time: 24 Hours'
    };
  } else if (alert.module === 'COST_CONTROL') {
    details = {
      analysis: 'Theoretical Food Cost is 28%, but Actual Cost is 34%. This 6% variance suggests either portioning issues, waste, or unrecorded price hikes from suppliers.',
      recommendation: 'Audit the portion sizes in the kitchen and check recent invoices for "Lamb Shoulder".',
      actionLabel: 'View Recipe Card',
      secondaryInfo: 'Variance: -6.0%'
    };
  } else if (alert.module === 'HR') {
    details = {
      analysis: 'Staff member Ali K. was scheduled to clock in at 09:00 AM but has not registered attendance as of 09:20 AM.',
      recommendation: 'Contact the staff member immediately. If unavailable, assign "Sarah M." to cover the section.',
      actionLabel: 'View Schedule',
      secondaryInfo: 'Shift: Morning Prep'
    };
  }

  const isCritical = alert.type === 'critical';
  const isWarning = alert.type === 'warning';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-lg rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className={`h-2 w-full ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
        
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-start">
          <div className="flex gap-4">
             <div className={`p-3 rounded-xl border ${isCritical ? 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-600 dark:text-red-500' : isWarning ? 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900 text-yellow-600 dark:text-yellow-500' : 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-500'}`}>
                {isCritical ? <AlertTriangle size={24} /> : isWarning ? <AlertTriangle size={24} /> : <Info size={24} />}
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none mb-2">Operational Alert</h2>
                <div className="flex items-center gap-2">
                   <span className="text-xs font-bold text-gray-600 dark:text-neutral-400 bg-gray-200 dark:bg-neutral-800 px-2 py-0.5 rounded">{alert.module}</span>
                   <span className="text-xs text-gray-500 dark:text-neutral-500">• {new Date().toLocaleTimeString()}</span>
                </div>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
           <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{alert.msg}</h3>
              <div className="bg-gray-50 dark:bg-neutral-900/50 rounded-lg p-4 border border-gray-200 dark:border-neutral-800">
                 <h4 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2 flex items-center gap-2">
                    <Activity size={12} /> System Analysis
                 </h4>
                 <p className="text-sm text-gray-700 dark:text-neutral-300 leading-relaxed">
                    {details.analysis}
                 </p>
                 <div className="mt-3 pt-3 border-t border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                    <span className="text-xs font-mono text-gray-500 dark:text-neutral-500">{details.secondaryInfo}</span>
                 </div>
              </div>
           </div>

           <div>
              <h4 className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase mb-2 flex items-center gap-2">
                 <Brain size={12} /> Recommended Action
              </h4>
              <p className="text-sm text-gray-900 dark:text-white italic">
                 "{details.recommendation}"
              </p>
           </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex gap-3">
           <button 
             onClick={onClose}
             className="flex-1 py-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition-colors"
           >
             Acknowledge
           </button>
           <button 
             onClick={onClose}
             className={`flex-1 py-3 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg ${isCritical ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' : isWarning ? 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-900/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-900/20'}`}
           >
             {alert.module === 'INVENTORY' ? <Truck size={16}/> : alert.module === 'COST_CONTROL' ? <FileText size={16}/> : alert.module === 'HR' ? <Phone size={16}/> : <CheckCircle size={16}/>}
             {details.actionLabel}
           </button>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  onNavigate: (module: Module) => void;
  currentBranch: Branch;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, currentBranch }) => {
  const { theme } = useApp();
  const [activeAICategory, setActiveAICategory] = useState<AICategory | 'ALL'>('ALL');
  const [recommendations, setRecommendations] = useState(AI_RECOMMENDATIONS);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  
  // Filter States
  const [dateRange, setDateRange] = useState<'TODAY' | 'WEEK' | '30_DAYS' | 'MONTH_PICKER' | 'CUSTOM'>('TODAY');
  const [locationFilter, setLocationFilter] = useState<string>(currentBranch.id);
  const [productCategory, setProductCategory] = useState<'ALL' | 'FOOD' | 'BEVERAGE'>('ALL');
  const [menuItemFilter, setMenuItemFilter] = useState<string>('ALL');
  
  // Searchable Dropdown State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Date States
  const [specificMonth, setSpecificMonth] = useState(new Date().toISOString().slice(0, 7));
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [pendingMonth, setPendingMonth] = useState(specificMonth);
  const [pendingStart, setPendingStart] = useState(customStart);
  const [pendingEnd, setPendingEnd] = useState(customEnd);

  const applyMonth = () => setSpecificMonth(pendingMonth);
  const applyCustom = () => { setCustomStart(pendingStart); setCustomEnd(pendingEnd); };

  useEffect(() => { setMenuItemFilter('ALL'); setSearchQuery(''); }, [productCategory]);

  const handleAction = (id: string, action: 'APPROVE' | 'DISMISS') => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  const filteredRecs = activeAICategory === 'ALL' ? recommendations : recommendations.filter(r => r.category === activeAICategory);

  const availableMenuItems = useMemo(() => {
    if (productCategory === 'ALL') return MENU_ITEMS;
    if (productCategory === 'FOOD') return MENU_ITEMS.filter(i => ['1', '2', '4'].includes(i.categoryId));
    if (productCategory === 'BEVERAGE') return MENU_ITEMS.filter(i => ['3'].includes(i.categoryId));
    return MENU_ITEMS;
  }, [productCategory]);

  const chartData = useMemo(() => 
    generateChartData(dateRange, locationFilter, productCategory, menuItemFilter, customStart, customEnd, specificMonth), 
    [dateRange, locationFilter, productCategory, menuItemFilter, specificMonth, customStart, customEnd]
  );
  
  const kpiData = useMemo(() => {
    let salesBase = 1245.500;
    if (dateRange === 'WEEK') salesBase *= 7;
    if (dateRange === '30_DAYS') salesBase *= 30;
    if (dateRange === 'MONTH_PICKER') {
        const [year, month] = specificMonth.split('-').map(Number);
        const days = new Date(year, month, 0).getDate();
        salesBase *= days;
    }
    if (dateRange === 'CUSTOM') {
        if (customStart && customEnd) {
             const start = new Date(customStart);
             const end = new Date(customEnd);
             const diffTime = Math.abs(end.getTime() - start.getTime());
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
             salesBase *= (diffDays > 0 ? diffDays : 1);
        } else { salesBase *= 1; }
    }
    if (locationFilter === 'ALL') salesBase *= 4.2;
    if (productCategory === 'FOOD') salesBase *= 0.75;
    if (productCategory === 'BEVERAGE') salesBase *= 0.25;
    if (menuItemFilter !== 'ALL') {
        const popularity = (menuItemFilter.charCodeAt(menuItemFilter.length - 1) % 5) + 1; 
        salesBase *= (0.05 * popularity);
    }
    const noise = 0.95 + Math.random() * 0.1;
    return {
        sales: (salesBase * noise).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 }),
        cogs: (productCategory === 'FOOD' ? 32.5 : 28.4).toFixed(1),
        labor: (locationFilter === 'ALL' ? 19.5 : 18.2).toFixed(1),
        check: (8.250 * noise).toFixed(3)
    };
  }, [dateRange, locationFilter, productCategory, menuItemFilter, specificMonth, customStart, customEnd]);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {selectedAlert && <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Executive Overview</h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Operational • <span className="font-medium flex items-center gap-1"><MapPin size={12}/> {locationFilter === 'ALL' ? 'All Locations' : currentBranch.name}</span>
          </p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => onNavigate(Module.ACCOUNTING)} className="px-5 py-2.5 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white rounded-lg text-sm border border-gray-300 dark:border-neutral-700 font-medium hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors shadow-sm">
             Export P&L
           </button>
           <button onClick={() => onNavigate(Module.KDS)} className="px-5 py-2.5 bg-brand-red hover:bg-brand-redHover text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2">
             <Activity size={16} /> Live Kitchen View
           </button>
        </div>
      </div>

      {/* FILTER TOOLBAR */}
      <div className="bg-white dark:bg-brand-surface p-2 rounded-xl border border-gray-200 dark:border-neutral-800 flex flex-wrap gap-2 items-center shadow-sm">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-neutral-900/50 rounded-lg border border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 text-sm font-bold">
           <Filter size={16} /> Filters
        </div>
        
        <div className="relative group">
           <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="appearance-none bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:border-brand-red text-gray-900 dark:text-white text-sm font-medium rounded-lg pl-9 pr-8 py-2.5 outline-none cursor-pointer min-w-[180px] transition-colors">
             <option value="ALL">All Locations</option>
             {BRANCHES.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
           </select>
           <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
        </div>

        <div className="relative group">
           <select value={productCategory} onChange={(e) => setProductCategory(e.target.value as any)} className="appearance-none bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 hover:border-brand-red text-gray-900 dark:text-white text-sm font-medium rounded-lg pl-9 pr-8 py-2.5 outline-none cursor-pointer min-w-[160px] transition-colors">
             <option value="ALL">All Products</option>
             <option value="FOOD">Food Only</option>
             <option value="BEVERAGE">Beverages Only</option>
           </select>
           {productCategory === 'BEVERAGE' ? <Coffee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" /> : <Utensils size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />}
           <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
        </div>

        <div className="relative">
           {isMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>}
           <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-gray-900 dark:text-white text-sm font-medium rounded-lg pl-3 pr-2 py-2.5 min-w-[200px] hover:border-brand-red transition-colors relative z-50">
             <div className="flex items-center gap-2 truncate">
               <ShoppingBag size={14} className="text-gray-500 dark:text-neutral-500" />
               <span className="truncate max-w-[140px]">{menuItemFilter === 'ALL' ? 'All Items' : MENU_ITEMS.find(i => i.id === menuItemFilter)?.name || 'Unknown'}</span>
             </div>
             <ChevronDown size={14} className="text-gray-500 dark:text-neutral-500" />
           </button>

           {isMenuOpen && (
             <div className="absolute top-full left-0 mt-1 w-[250px] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
               <div className="p-2 border-b border-gray-200 dark:border-neutral-800">
                 <div className="relative">
                   <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
                   <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-100 dark:bg-neutral-800 rounded-md py-1.5 pl-8 pr-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-red placeholder:text-gray-500 dark:placeholder:text-neutral-600" autoFocus />
                 </div>
               </div>
               <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                 <button onClick={() => { setMenuItemFilter('ALL'); setIsMenuOpen(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors ${menuItemFilter === 'ALL' ? 'bg-brand-red text-white font-bold' : 'text-gray-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'}`}>All Items</button>
                 {availableMenuItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())).map(item => (
                     <button key={item.id} onClick={() => { setMenuItemFilter(item.id); setIsMenuOpen(false); setSearchQuery(''); }} className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 flex justify-between items-center transition-colors ${menuItemFilter === item.id ? 'bg-brand-red text-white font-bold' : 'text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'}`}>
                       <span className="truncate">{item.name}</span>
                       {menuItemFilter === item.id && <Check size={14} />}
                     </button>
                 ))}
               </div>
             </div>
           )}
        </div>

        <div className="h-8 w-px bg-gray-300 dark:bg-neutral-800 mx-2 hidden md:block"></div>

        <div className="flex bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg border border-gray-200 dark:border-neutral-800 overflow-x-auto">
           {[{ id: 'TODAY', label: 'Today' }, { id: 'WEEK', label: '7 Days' }, { id: '30_DAYS', label: '30 Days' }, { id: 'MONTH_PICKER', label: 'Month' }, { id: 'CUSTOM', label: 'Custom' }].map((range) => (
             <button key={range.id} onClick={() => setDateRange(range.id as any)} className={`whitespace-nowrap px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateRange === range.id ? 'bg-white dark:bg-neutral-700 text-black dark:text-white shadow' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
               {range.label}
             </button>
           ))}
        </div>

        {dateRange === 'MONTH_PICKER' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
             <input type="month" value={pendingMonth} onChange={(e) => setPendingMonth(e.target.value)} className="bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-gray-900 dark:text-white text-sm outline-none focus:border-brand-red" />
             <button onClick={applyMonth} className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors">Apply</button>
          </div>
        )}

        {dateRange === 'CUSTOM' && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-neutral-900 p-1 rounded-lg border border-gray-200 dark:border-neutral-800">
               <input type="date" value={pendingStart} onChange={(e) => setPendingStart(e.target.value)} className="bg-transparent text-gray-900 dark:text-white text-sm outline-none px-2 py-1" />
               <span className="text-gray-500 dark:text-neutral-500">-</span>
               <input type="date" value={pendingEnd} onChange={(e) => setPendingEnd(e.target.value)} className="bg-transparent text-gray-900 dark:text-white text-sm outline-none px-2 py-1" />
            </div>
            <button onClick={applyCustom} className="bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-900 dark:text-white border border-gray-300 dark:border-neutral-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors">Apply</button>
          </div>
        )}
      </div>

      <FinancialPulse currency={currentBranch.currency} />
      <OperationsVelocity />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Net Sales" value={`${currentBranch.currency} ${kpiData.sales}`} trend="+12.5%" isPositive={true} icon={<DollarSign size={22} />} />
        <KPICard title={menuItemFilter !== 'ALL' ? "Item Food Cost %" : "Food Cost (COGS)"} value={`${kpiData.cogs}%`} trend="-1.2%" isPositive={true} icon={<TrendingUp size={22} />} />
        <KPICard title="Labor Cost" value={`${kpiData.labor}%`} trend="+2.4%" isPositive={false} icon={<Users size={22} />} />
        <KPICard title="Avg Check Size" value={`${currentBranch.currency} ${kpiData.check}`} trend="+0.5%" isPositive={true} icon={<Activity size={22} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><ChannelMix currency={currentBranch.currency} /></div>
        <div className="lg:col-span-1 bg-white dark:bg-brand-surface p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales Pacing</h3>
             <span className="text-xs text-gray-500 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-900 px-2 py-1 rounded border border-gray-200 dark:border-neutral-800">
               {dateRange === 'MONTH_PICKER' ? specificMonth : (dateRange === 'CUSTOM' && customStart ? `${new Date(customStart).toLocaleDateString()} - ${new Date(customEnd).toLocaleDateString()}` : dateRange)}
             </span>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} vertical={false} />
                <XAxis dataKey="name" stroke={theme === 'dark' ? '#555' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} itemStyle={{ color: theme === 'dark' ? '#e5e5e5' : '#000' }} />
                <Area type="monotone" dataKey="sales" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="target" stroke={theme === 'dark' ? '#525252' : '#d1d5db'} strokeDasharray="4 4" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-b from-white to-gray-50 dark:from-brand-surface dark:to-[#111] p-0 rounded-2xl border border-gray-200 dark:border-neutral-700 overflow-hidden flex flex-col shadow-lg">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-800/30 flex justify-between items-center backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="bg-brand-red/10 p-2 rounded-lg text-brand-red">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Foodika AI Engine</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-400">4 Active Recommendations awaiting approval</p>
              </div>
            </div>
            <div className="flex gap-1 bg-gray-200 dark:bg-black/40 p-1 rounded-lg">
              {['ALL', 'COST_CONTROL', 'MENU', 'STAFF'].map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveAICategory(cat === 'MENU' ? 'MENU_PERFORMANCE' : cat as any)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${
                    (activeAICategory === cat || (cat === 'MENU' && activeAICategory === 'MENU_PERFORMANCE'))
                    ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-neutral-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
            {filteredRecs.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-neutral-500">
                 <CheckCircle size={40} className="mb-3 opacity-20" />
                 <p>All clear. No actions required.</p>
               </div>
            ) : (
              filteredRecs.map((rec) => (
                <div key={rec.id} className="bg-white dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-700/50 rounded-xl p-5 hover:border-gray-300 dark:hover:border-neutral-600 transition-all group shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-3">
                      <span className="text-[10px] font-bold tracking-wider text-gray-500 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-900 px-2 py-1 rounded uppercase">
                        {rec.category.replace('_', ' ')}
                      </span>
                      <RiskBadge level={rec.risk} />
                    </div>
                    <span className="text-green-600 dark:text-green-400 text-xs font-bold flex items-center gap-1 bg-green-100 dark:bg-green-900/10 px-2 py-1 rounded">
                      <TrendingUp size={12} /> {rec.impact}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{rec.title}</h4>
                    <p className="text-gray-600 dark:text-neutral-300 text-sm mb-2"><span className="text-red-500 dark:text-red-400 font-semibold">Problem:</span> {rec.problem}</p>
                    <div className="bg-gray-50 dark:bg-neutral-900/50 p-3 rounded-lg border-l-2 border-brand-red/50">
                      <p className="text-gray-500 dark:text-neutral-400 text-xs italic">Evidence: "{rec.evidence}"</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-neutral-700/50">
                    <div className="text-sm text-gray-700 dark:text-neutral-200 font-medium flex items-center gap-2">
                       <span className="text-brand-red">Action:</span> {rec.action}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(rec.id, 'DISMISS')} className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white transition-colors" title="Dismiss">
                        <XCircle size={20} />
                      </button>
                      <button onClick={() => handleAction(rec.id, 'APPROVE')} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-brand-red hover:text-white rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-red-900/50">
                        <CheckCircle size={16} /> Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-brand-surface p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm">
           <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Operations Feed</h3>
           <div className="space-y-3">
             {ALERTS.map((alert) => (
               <div key={alert.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-800/50 rounded-xl border border-gray-200 dark:border-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600 transition-all">
                 <div className="flex items-center gap-4">
                   <div className={`p-2 rounded-full ${alert.type === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'}`}>
                      <AlertTriangle size={18} />
                   </div>
                   <div>
                      <div className="text-sm text-gray-900 dark:text-white font-medium">{alert.msg}</div>
                      <div className="text-xs text-gray-500 dark:text-neutral-500 mt-0.5">{new Date().toLocaleTimeString()} • {alert.module}</div>
                   </div>
                 </div>
                 <button onClick={() => setSelectedAlert(alert)} className="text-xs bg-gray-200 dark:bg-neutral-800 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-black text-gray-600 dark:text-neutral-300 px-3 py-1.5 rounded transition-colors">
                   View
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-brand-surface p-6 rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-sm">
          <div className="flex justify-between mb-4 items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu Performance Matrix</h3>
            <button onClick={() => onNavigate(Module.MENU_ENGINEERING)} className="text-xs text-gray-500 dark:text-neutral-400 flex items-center hover:text-gray-900 dark:hover:text-white hover:underline gap-1">
              View Detail <ChevronRight size={14} />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid stroke={theme === 'dark' ? '#333' : '#e5e7eb'} strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" name="Popularity" stroke={theme === 'dark' ? '#555' : '#9ca3af'} label={{ value: 'Popularity', position: 'bottom', offset: 0, fill: theme === 'dark' ? '#555' : '#9ca3af', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Profit" stroke={theme === 'dark' ? '#555' : '#9ca3af'} label={{ value: 'Profitability', angle: -90, position: 'left', fill: theme === 'dark' ? '#555' : '#9ca3af', fontSize: 10 }} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}` }} />
                <Scatter name="Menu Items" data={mixData} fill="#EF4444" shape="circle" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
