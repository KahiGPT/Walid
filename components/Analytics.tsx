
import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { MENU_ITEMS } from '../constants';
import { TrendingUp, DollarSign, PieChart as PieIcon, Activity, ArrowUpRight, ArrowDownRight, Info, X, Star, HelpCircle, AlertTriangle, TrendingDown, Square, Triangle, Circle } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mock Data Generators
const getHourlyData = (period: string) => {
  if (period === 'Last Friday') {
    // Weekend Pattern: High Lunch (1-3pm) and High Dinner (7-10pm)
    return [
      { time: '11am', sales: 250 }, { time: '12pm', sales: 550 }, { time: '1pm', sales: 850 },
      { time: '2pm', sales: 900 }, { time: '3pm', sales: 600 }, { time: '4pm', sales: 450 },
      { time: '5pm', sales: 700 }, { time: '6pm', sales: 1100 }, { time: '7pm', sales: 1450 },
      { time: '8pm', sales: 1300 }, { time: '9pm', sales: 950 }, { time: '10pm', sales: 600 },
    ];
  } else if (period === 'Yesterday') {
    // Weekday Pattern: Steady Lunch, Lower Dinner
    return [
      { time: '11am', sales: 100 }, { time: '12pm', sales: 280 }, { time: '1pm', sales: 450 },
      { time: '2pm', sales: 380 }, { time: '3pm', sales: 120 }, { time: '4pm', sales: 180 },
      { time: '5pm', sales: 320 }, { time: '6pm', sales: 550 }, { time: '7pm', sales: 720 },
      { time: '8pm', sales: 650 }, { time: '9pm', sales: 400 }, { time: '10pm', sales: 200 },
    ];
  }
  // Today (Default)
  return [
    { time: '11am', sales: 120 }, { time: '12pm', sales: 350 }, { time: '1pm', sales: 480 },
    { time: '2pm', sales: 400 }, { time: '3pm', sales: 150 }, { time: '4pm', sales: 220 },
    { time: '5pm', sales: 380 }, { time: '6pm', sales: 620 }, { time: '7pm', sales: 850 },
    { time: '8pm', sales: 780 }, { time: '9pm', sales: 500 }, { time: '10pm', sales: 300 },
  ];
};

const getKPIData = (period: string) => {
  switch (period) {
    case 'Last Friday':
      return { 
        revenue: '9,850 KWD', orders: '1,120', ticket: '8.795 KWD', 
        revTrend: 18.5, orderTrend: 15.2, ticketTrend: 2.4,
        margin: '71.5%'
      };
    case 'Yesterday':
      return { 
        revenue: '4,350 KWD', orders: '540', ticket: '8.055 KWD', 
        revTrend: -5.2, orderTrend: -2.1, ticketTrend: -0.5,
        margin: '66.8%'
      };
    case 'Today':
    default:
      return { 
        revenue: '5,150 KWD', orders: '607', ticket: '8.490 KWD', 
        revTrend: 12.5, orderTrend: 8.2, ticketTrend: -2.1,
        margin: '68.2%'
      };
  }
};

const categoryData = [
  { name: 'Main Course', value: 4500, color: '#EF4444' },
  { name: 'Appetizers', value: 1200, color: '#F59E0B' },
  { name: 'Beverages', value: 800, color: '#3B82F6' },
  { name: 'Desserts', value: 650, color: '#10B981' },
];

// Menu Engineering Data: x=Popularity (Qty Sold), y=Profitability (Margin), z=Revenue
const menuMatrixData = [
  { name: 'Machboos', x: 85, y: 3.3, z: 280, type: 'Star' }, // High Pop, High Profit
  { name: 'Biryani', x: 92, y: 1.8, z: 165, type: 'Plowhorse' }, // High Pop, Low Profit
  { name: 'Hummus', x: 25, y: 0.95, z: 23, type: 'Dog' }, // Low Pop, Low Profit
  { name: 'Steak', x: 18, y: 8.5, z: 153, type: 'Puzzle' }, // Low Pop, High Profit
  { name: 'Fattoush', x: 45, y: 1.3, z: 58, type: 'Dog' },
  { name: 'Lemon Mint', x: 78, y: 1.3, z: 101, type: 'Plowhorse' },
  { name: 'Umm Ali', x: 32, y: 1.4, z: 44, type: 'Puzzle' },
];

const KPICard = ({ title, value, sub, icon: Icon, trend }: any) => (
  <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 animate-in fade-in duration-500 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-gray-100 dark:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-400"><Icon size={20} /></div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trend > 0 ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500'}`}>
        {trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>} {Math.abs(trend)}%
      </span>
    </div>
    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1 transition-all">{value}</div>
    <div className="text-sm text-gray-500 dark:text-neutral-500">{sub}</div>
  </div>
);

const CustomNode = (props: any) => {
  const { cx, cy, payload } = props;
  const size = props.size || 250;
  const r = Math.sqrt(size) / 1.5; 

  if (payload.type === 'Star') {
    return (
      <path 
        d={`M${cx},${cy-r} L${cx+r*0.22},${cy-r*0.3} L${cx+r},${cy-r*0.3} L${cx+r*0.36},${cy+r*0.15} L${cx+r*0.58},${cy+r} L${cx},${cy+r*0.6} L${cx-r*0.58},${cy+r} L${cx-r*0.36},${cy+r*0.15} L${cx-r},${cy-r*0.3} L${cx-r*0.22},${cy-r*0.3} Z`} 
        fill="#FACC15" // Yellow-400
        stroke="#FEF08A" 
        strokeWidth={1}
      />
    );
  }
  
  if (payload.type === 'Plowhorse') {
    return (
      <rect 
        x={cx - r} 
        y={cy - r} 
        width={r * 2} 
        height={r * 2} 
        fill="#60A5FA" // Blue-400
        stroke="#BFDBFE"
        strokeWidth={1}
        rx={2}
      />
    );
  }
  
  if (payload.type === 'Puzzle') {
    // Triangle
    return (
      <path
        d={`M${cx},${cy-r} L${cx+r},${cy+r} L${cx-r},${cy+r} Z`}
        fill="#4ADE80" // Green-400
        stroke="#BBF7D0"
        strokeWidth={1}
      />
    );
  }
  
  if (payload.type === 'Dog') {
    return (
      <circle 
        cx={cx} 
        cy={cy} 
        r={r} 
        fill="#F87171" // Red-400
        stroke="#FECACA"
        strokeWidth={1}
      />
    );
  }

  return <circle cx={cx} cy={cy} r={r} fill="#fff" />;
};

const QuadrantModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-3xl rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Info className="text-brand-red" /> Menu Engineering Matrix
            </h2>
            <p className="text-gray-500 dark:text-neutral-400 text-sm">Understanding profitability vs. popularity quadrants.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-800 rounded-lg text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Matrix Grid */}
        <div className="flex-1 p-8 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-neutral-900/50">
          
          {/* Top Left: Puzzle */}
          <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-700 rounded-xl p-5 relative overflow-hidden group hover:border-green-500/50 transition-colors shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-green-600 dark:text-green-400 flex items-center gap-2"><Triangle size={18} fill="currentColor" /> Puzzles</h3>
              <HelpCircle size={20} className="text-green-500/50" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Profitability</span> <span className="text-gray-900 dark:text-white font-bold">HIGH</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Popularity</span> <span className="text-gray-500 dark:text-neutral-500 font-bold">LOW</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Strategy</span>
              <p className="text-gray-700 dark:text-white text-sm mt-1">Investigate why they don't sell. Promote heavily, rename, or improve visibility on menu.</p>
            </div>
          </div>

          {/* Top Right: Star */}
          <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-700 rounded-xl p-5 relative overflow-hidden group hover:border-yellow-500/50 transition-colors shadow-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-yellow-500"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-yellow-600 dark:text-yellow-400 flex items-center gap-2"><Star size={18} fill="currentColor" /> Stars</h3>
              <Star size={20} className="text-yellow-500/50 fill-yellow-500/20" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Profitability</span> <span className="text-gray-900 dark:text-white font-bold">HIGH</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Popularity</span> <span className="text-gray-900 dark:text-white font-bold">HIGH</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Strategy</span>
              <p className="text-gray-700 dark:text-white text-sm mt-1">Your flagship items. Maintain consistent quality and visibility. Do not alter recipes.</p>
            </div>
          </div>

          {/* Bottom Left: Dog */}
          <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-700 rounded-xl p-5 relative overflow-hidden group hover:border-red-500/50 transition-colors shadow-sm">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2"><Circle size={18} fill="currentColor" /> Dogs</h3>
              <AlertTriangle size={20} className="text-red-500/50" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Profitability</span> <span className="text-gray-500 dark:text-neutral-500 font-bold">LOW</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Popularity</span> <span className="text-gray-500 dark:text-neutral-500 font-bold">LOW</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Strategy</span>
              <p className="text-gray-700 dark:text-white text-sm mt-1">Remove from menu to simplify operations, or re-engineer completely to increase margin.</p>
            </div>
          </div>

          {/* Bottom Right: Plowhorse */}
          <div className="bg-white dark:bg-brand-surface border border-gray-200 dark:border-neutral-700 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-colors shadow-sm">
            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2"><Square size={18} fill="currentColor" /> Plowhorses</h3>
              <TrendingDown size={20} className="text-blue-500/50" />
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Profitability</span> <span className="text-gray-500 dark:text-neutral-500 font-bold">LOW</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-neutral-400">
                <span>Popularity</span> <span className="text-gray-900 dark:text-white font-bold">HIGH</span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-gray-500 dark:text-neutral-500 uppercase tracking-wider">Strategy</span>
              <p className="text-gray-700 dark:text-white text-sm mt-1">Increase price slightly or reduce portion size/cost. Keep on menu as they drive traffic.</p>
            </div>
          </div>

        </div>
        
        <div className="p-6 bg-gray-50 dark:bg-brand-surface border-t border-gray-200 dark:border-neutral-800 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-gray-900 dark:bg-neutral-800 hover:bg-black dark:hover:bg-neutral-700 text-white rounded-lg font-bold transition-colors">
             Got it
           </button>
        </div>
      </div>
    </div>
  );
};

export const Analytics: React.FC = () => {
  const { theme } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('Today');
  const [showQuadrantInfo, setShowQuadrantInfo] = useState(false);

  const hourlyData = useMemo(() => getHourlyData(selectedPeriod), [selectedPeriod]);
  const kpis = useMemo(() => getKPIData(selectedPeriod), [selectedPeriod]);

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 flex flex-col space-y-6 overflow-y-auto">
      {showQuadrantInfo && <QuadrantModal onClose={() => setShowQuadrantInfo(false)} />}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <TrendingUp className="text-brand-red" /> Performance Analytics
        </h1>
        <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Deep dive into sales, menu performance, and trends.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={kpis.revenue} sub="Gross Sales" icon={DollarSign} trend={kpis.revTrend} />
        <KPICard title="Total Orders" value={kpis.orders} sub="Completed Orders" icon={Activity} trend={kpis.orderTrend} />
        <KPICard title="Avg Ticket" value={kpis.ticket} sub="Per Order" icon={PieIcon} trend={kpis.ticketTrend} />
        <KPICard title="Gross Margin" value={kpis.margin} sub="Food Cost: 31.8%" icon={TrendingUp} trend={1.5} />
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-gray-900 dark:text-white">Hourly Sales Performance</h3>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white text-xs font-bold rounded-lg px-3 py-2 outline-none hover:border-brand-red transition-colors cursor-pointer"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="Last Friday">Last Friday</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} vertical={false} />
                <XAxis dataKey="time" stroke={theme === 'dark' ? '#666' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={theme === 'dark' ? '#666' : '#9ca3af'} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} 
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#EF4444" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 flex flex-col shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Revenue by Category</h3>
          <div className="h-48 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, borderRadius: '8px' }} 
                    itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} 
                  />
                </PieChart>
             </ResponsiveContainer>
             
             {/* Center Label */}
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-gray-500 dark:text-neutral-500 uppercase tracking-wider font-bold">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                   {selectedPeriod === 'Last Friday' ? '9.8k' : selectedPeriod === 'Yesterday' ? '4.3k' : '5.1k'}
                </span>
             </div>
          </div>
          
          {/* Legend */}
          <div className="flex-1 flex flex-col justify-center space-y-3 mt-2">
             {categoryData.map(cat => (
               <div key={cat.name} className="flex justify-between items-center text-sm group">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}40`}}></div>
                     <span className="text-gray-600 dark:text-neutral-300 font-medium group-hover:text-black dark:group-hover:text-white transition-colors">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white font-mono">{((cat.value / 7150) * 100).toFixed(1)}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Menu Engineering Matrix */}
      <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex justify-between items-start mb-4">
           <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Menu Engineering Matrix</h3>
              <p className="text-gray-500 dark:text-neutral-400 text-sm">Analysis of Item Popularity vs. Profitability</p>
           </div>
           <button 
             onClick={() => setShowQuadrantInfo(true)}
             className="text-xs bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300 px-3 py-1.5 rounded flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-neutral-700 hover:text-black dark:hover:text-white transition-colors border border-gray-200 dark:border-neutral-700"
           >
             <Info size={14} /> Explain Quadrants
           </button>
        </div>

        <div className="h-[400px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                <XAxis type="number" dataKey="x" name="Popularity" stroke={theme === 'dark' ? '#666' : '#9ca3af'} label={{ value: 'Quantity Sold (Popularity)', position: 'bottom', offset: 0, fill: theme === 'dark' ? '#666' : '#9ca3af' }} />
                <YAxis type="number" dataKey="y" name="Profit" stroke={theme === 'dark' ? '#666' : '#9ca3af'} label={{ value: 'Profit Margin KWD (Profitability)', angle: -90, position: 'left', fill: theme === 'dark' ? '#666' : '#9ca3af' }} />
                <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Revenue" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 p-3 rounded-lg shadow-xl">
                          <p className="font-bold text-gray-900 dark:text-white mb-1">{data.name}</p>
                          <p className="text-xs text-gray-500 dark:text-neutral-400">Class: <span className="text-brand-red font-bold uppercase">{data.type}</span></p>
                          <div className="mt-2 space-y-1 text-xs">
                             <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-neutral-500">Sold:</span> <span className="text-gray-900 dark:text-white">{data.x}</span></div>
                             <div className="flex justify-between gap-4"><span className="text-gray-500 dark:text-neutral-500">Margin:</span> <span className="text-gray-900 dark:text-white">{data.y} KWD</span></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Menu Items" data={menuMatrixData} shape={<CustomNode />} />
                
                {/* Quadrant Lines (approximate centers) */}
                <path d="M 0 250 H 500" stroke={theme === 'dark' ? '#444' : '#e5e7eb'} strokeDasharray="5 5" />
                
              </ScatterChart>
           </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-neutral-800">
           {[
             { title: 'Stars', desc: 'High Profit, High Popularity. Maintain quality.', color: 'text-yellow-500 dark:text-yellow-400', icon: Star },
             { title: 'Plowhorses', desc: 'Low Profit, High Popularity. Increase price slightly.', color: 'text-blue-600 dark:text-blue-400', icon: Square },
             { title: 'Puzzles', desc: 'High Profit, Low Popularity. Promote more.', color: 'text-green-600 dark:text-green-400', icon: Triangle },
             { title: 'Dogs', desc: 'Low Profit, Low Popularity. Remove from menu.', color: 'text-red-600 dark:text-red-400', icon: Circle },
           ].map(q => (
             <div key={q.title} className="text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800/30 rounded-lg p-2 transition-colors flex flex-col items-center" onClick={() => setShowQuadrantInfo(true)}>
                <div className={`font-bold text-lg ${q.color} flex items-center gap-2`}>
                  <q.icon size={18} className="fill-current" />
                  {q.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{q.desc}</div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
