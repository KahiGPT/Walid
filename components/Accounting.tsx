
import React, { useState } from 'react';
import { EXPENSES, DAILY_CLOSES } from '../constants';
import { Expense, DailyClose, PnLRow, ExpenseCategory, PaymentMethod } from '../types';
import { 
  DollarSign, TrendingDown, TrendingUp, PieChart, Calendar, 
  FileText, Plus, Check, X, Printer, Lock, AlertCircle, 
  ChevronRight, ArrowRight, CreditCard, Banknote, CheckCircle, Clock, Save
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { useApp } from '../context/AppContext';

type ViewMode = 'DASHBOARD' | 'PNL' | 'EXPENSES' | 'Z_REPORTS';

// --- SUB-COMPONENTS ---

const AddExpenseModal = ({ onClose, onSave }: { onClose: () => void, onSave: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'OTHER' as ExpenseCategory,
    payee: '',
    paymentMethod: 'CASH' as PaymentMethod,
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (!formData.amount || !formData.description || !formData.payee) return;
    onSave({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date(formData.date)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-lg rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Record Expense</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"><X size={24}/></button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Amount (KWD)</label>
            <input 
              type="number" 
              autoFocus
              step="0.001"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-xl p-4 text-2xl font-mono font-bold text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="0.000"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Description</label>
            <input 
              type="text" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              placeholder="e.g. Weekly Vegetable Supply"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              >
                <option value="RENT">Rent</option>
                <option value="UTILITIES">Utilities</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="MARKETING">Marketing</option>
                <option value="SOFTWARE">Software</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Payee / Vendor</label>
               <input 
                 type="text" 
                 value={formData.payee}
                 onChange={e => setFormData({...formData, payee: e.target.value})}
                 className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
                 placeholder="e.g. STC"
               />
             </div>
             <div>
               <label className="block text-xs font-bold text-gray-500 dark:text-neutral-500 mb-2">Payment Method</label>
               <select 
                 value={formData.paymentMethod}
                 onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                 className="w-full bg-gray-50 dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg p-3 text-gray-900 dark:text-white focus:border-brand-red outline-none"
               >
                 <option value="CASH">Petty Cash</option>
                 <option value="BANK_TRANSFER">Bank Transfer</option>
                 <option value="CREDIT_CARD">Credit Card</option>
               </select>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-lg font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            className="px-6 py-3 rounded-lg font-bold bg-brand-red text-white hover:bg-brand-redHover shadow-lg shadow-red-900/20 flex items-center gap-2"
          >
            <Save size={18} /> Save Expense
          </button>
        </div>
      </div>
    </div>
  );
};

const PnLTable: React.FC = () => {
  // Mock P&L Calculation logic
  const revenue = 12500.000;
  const cogs = 3500.000;
  const grossProfit = revenue - cogs;
  const labor = 2200.000;
  const rent = 1500.000;
  const utilities = 350.000;
  const marketing = 450.000;
  const otherExpenses = 250.000;
  const totalOpex = labor + rent + utilities + marketing + otherExpenses;
  const netProfit = grossProfit - totalOpex;

  const rows: PnLRow[] = [
    { label: 'Gross Sales', value: revenue, percentage: 100, type: 'REVENUE', level: 1 },
    { label: 'Cost of Goods Sold (COGS)', value: -cogs, percentage: (cogs/revenue)*100, type: 'COST', level: 2 },
    { label: 'GROSS PROFIT', value: grossProfit, percentage: (grossProfit/revenue)*100, type: 'PROFIT', level: 1 },
    { label: 'Labor Cost', value: -labor, percentage: (labor/revenue)*100, type: 'EXPENSE', level: 2 },
    { label: 'Rent', value: -rent, percentage: (rent/revenue)*100, type: 'EXPENSE', level: 2 },
    { label: 'Utilities', value: -utilities, percentage: (utilities/revenue)*100, type: 'EXPENSE', level: 2 },
    { label: 'Marketing', value: -marketing, percentage: (marketing/revenue)*100, type: 'EXPENSE', level: 2 },
    { label: 'Other Expenses', value: -otherExpenses, percentage: (otherExpenses/revenue)*100, type: 'EXPENSE', level: 2 },
    { label: 'TOTAL OPEX', value: -totalOpex, percentage: (totalOpex/revenue)*100, type: 'COST', level: 1 },
    { label: 'NET PROFIT (EBITDA)', value: netProfit, percentage: (netProfit/revenue)*100, type: 'PROFIT', level: 1 },
  ];

  return (
    <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 dark:text-white">Profit & Loss Statement (MTD)</h3>
        <button className="text-xs flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded text-gray-700 dark:text-neutral-300 border border-gray-200 dark:border-neutral-700 hover:text-black dark:hover:text-white"><Printer size={14}/> Print</button>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400">
           <tr>
             <th className="p-4 text-left">Item</th>
             <th className="p-4 text-right">Amount (KWD)</th>
             <th className="p-4 text-right">% of Sales</th>
           </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
          {rows.map((row, idx) => (
            <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-neutral-800/30 ${row.type === 'PROFIT' ? 'bg-gray-100 dark:bg-neutral-900/50 font-bold' : ''}`}>
              <td className={`p-4 ${row.level === 1 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400 pl-8'}`}>
                {row.label}
              </td>
              <td className={`p-4 text-right font-mono ${row.value < 0 ? 'text-red-500 dark:text-red-400' : row.type === 'PROFIT' ? 'text-green-600 dark:text-green-500' : 'text-gray-900 dark:text-white'}`}>
                {row.value < 0 ? `(${Math.abs(row.value).toFixed(3)})` : row.value.toFixed(3)}
              </td>
              <td className="p-4 text-right font-mono text-gray-500 dark:text-neutral-500">
                {row.percentage.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ZReportModal: React.FC<{ report: DailyClose, onClose: () => void }> = ({ report, onClose }) => {
  const [cashInput, setCashInput] = useState(report.status === 'OPEN' ? '' : report.cashActual.toString());
  
  const cashVal = parseFloat(cashInput) || 0;
  const variance = cashVal - report.cashExpected;
  const isVariance = Math.abs(variance) > 0.050;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
         <div className="p-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Daily Closing (Z-Report)</h2>
              <div className="text-xs text-gray-500 dark:text-neutral-400">{report.date.toLocaleDateString()} • ID: {report.id}</div>
            </div>
            <button onClick={onClose}><X size={24} className="text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white"/></button>
         </div>
         
         <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
                 <div className="text-xs text-gray-500 dark:text-neutral-500">Gross Sales</div>
                 <div className="text-lg font-bold text-gray-900 dark:text-white font-mono">{report.grossSales.toFixed(3)}</div>
               </div>
               <div className="bg-gray-100 dark:bg-neutral-800 p-3 rounded-lg border border-gray-200 dark:border-neutral-700">
                 <div className="text-xs text-gray-500 dark:text-neutral-500">Net Sales</div>
                 <div className="text-lg font-bold text-green-600 dark:text-green-500 font-mono">{report.netSales.toFixed(3)}</div>
               </div>
            </div>

            <div className="space-y-3">
               <h3 className="font-bold text-gray-900 dark:text-white text-sm">Payment Breakdown</h3>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-neutral-400 flex items-center gap-2"><CreditCard size={14}/> Cards (KNET/Credit)</span>
                  <span className="font-mono text-gray-900 dark:text-white">{report.cardTotal.toFixed(3)}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 dark:text-neutral-400 flex items-center gap-2"><ArrowRight size={14}/> Delivery Platforms</span>
                  <span className="font-mono text-gray-900 dark:text-white">{report.deliveryTotal.toFixed(3)}</span>
               </div>
               <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200 dark:border-neutral-800">
                  <span className="text-gray-700 dark:text-neutral-300 flex items-center gap-2 font-bold"><Banknote size={14}/> Cash Expected</span>
                  <span className="font-mono text-brand-red font-bold">{report.cashExpected.toFixed(3)}</span>
               </div>
            </div>

            {report.status === 'OPEN' ? (
              <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800">
                <label className="block text-sm font-bold text-gray-500 dark:text-neutral-400 mb-2">Counted Cash Amount</label>
                <div className="flex items-center gap-2">
                   <span className="text-lg font-bold text-gray-900 dark:text-white">KWD</span>
                   <input 
                     type="number" 
                     className="bg-transparent border-b-2 border-gray-300 dark:border-neutral-700 w-full text-2xl font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:border-brand-red"
                     placeholder="0.000"
                     autoFocus
                     value={cashInput}
                     onChange={(e) => setCashInput(e.target.value)}
                   />
                </div>
                {isVariance && (
                   <div className="mt-3 text-red-500 text-xs flex items-center gap-2 bg-red-100 dark:bg-red-900/10 p-2 rounded">
                      <AlertCircle size={14} /> Variance Detected: {variance > 0 ? '+' : ''}{variance.toFixed(3)} KWD
                   </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-neutral-900 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 flex justify-between items-center">
                 <span className="text-gray-500 dark:text-neutral-400 text-sm">Counted Cash</span>
                 <span className="text-xl font-bold font-mono text-gray-900 dark:text-white">{report.cashActual.toFixed(3)}</span>
              </div>
            )}
         </div>

         {report.status === 'OPEN' && (
           <div className="p-6 border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900">
             <button onClick={onClose} className="w-full py-3 bg-brand-red hover:bg-brand-redHover text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-red-900/20">
               <Lock size={18} /> CLOSE DAY & PRINT
             </button>
           </div>
         )}
      </div>
    </div>
  );
};

export const Accounting: React.FC = () => {
  const { theme } = useApp();
  const [view, setView] = useState<ViewMode>('DASHBOARD');
  const [activeReport, setActiveReport] = useState<DailyClose | null>(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES);

  const handleAddExpense = (data: any) => {
    const newExpense: Expense = {
      id: `EX-${Date.now()}`,
      status: 'PENDING',
      ...data
    };
    setExpenses([newExpense, ...expenses]);
    setShowAddExpense(false);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 flex flex-col space-y-6 overflow-y-auto">
      {activeReport && <ZReportModal report={activeReport} onClose={() => setActiveReport(null)} />}
      {showAddExpense && <AddExpenseModal onClose={() => setShowAddExpense(false)} onSave={handleAddExpense} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
             <DollarSign className="text-brand-red" /> Operational Accounting
           </h1>
           <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Daily closing, expense tracking, and P&L.</p>
        </div>
        
        <div className="flex bg-gray-200 dark:bg-neutral-900 p-1 rounded-lg border border-gray-300 dark:border-neutral-800">
           <button onClick={() => setView('DASHBOARD')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'DASHBOARD' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Overview</button>
           <button onClick={() => setView('Z_REPORTS')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'Z_REPORTS' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Z-Reports</button>
           <button onClick={() => setView('EXPENSES')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'EXPENSES' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>Expenses</button>
           <button onClick={() => setView('PNL')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${view === 'PNL' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>P&L Report</button>
        </div>
      </div>

      {view === 'DASHBOARD' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded text-green-600 dark:text-green-500"><TrendingUp size={16}/></div>
                 <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase">Net Profit (MTD)</span>
               </div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">1,845.500</div>
               <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">14.7% Margin</div>
             </div>
             
             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1.5 bg-red-100 dark:bg-red-900/20 rounded text-red-500"><TrendingDown size={16}/></div>
                 <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase">Total Expenses</span>
               </div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">4,200.000</div>
               <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">Includes COGS & Labor</div>
             </div>

             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded text-blue-600 dark:text-blue-500"><PieChart size={16}/></div>
                 <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase">Prime Cost</span>
               </div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">58.2%</div>
               <div className="text-xs text-gray-500 dark:text-neutral-500 mt-1">Target: &lt; 60%</div>
             </div>

             <div className="bg-white dark:bg-brand-surface p-6 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <div className="p-1.5 bg-gray-100 dark:bg-neutral-800 rounded text-gray-500 dark:text-neutral-400"><Calendar size={16}/></div>
                 <span className="text-xs font-bold text-gray-500 dark:text-neutral-400 uppercase">Last Close</span>
               </div>
               <div className="text-3xl font-bold text-gray-900 dark:text-white">Yesterday</div>
               <div className="text-xs text-green-600 dark:text-green-500 mt-1 flex items-center gap-1"><CheckCircle size={10}/> Balanced (0.000)</div>
             </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PnLTable />
              </div>
              <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Cost Breakdown</h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={[
                        { name: 'COGS', value: 3500 },
                        { name: 'Labor', value: 2200 },
                        { name: 'Rent', value: 1500 },
                        { name: 'Marketing', value: 450 },
                        { name: 'Other', value: 600 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme === 'dark' ? '#333' : '#e5e7eb'} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#888" width={80} tick={{fontSize: 12}} />
                        <Tooltip cursor={{fill: theme === 'dark' ? '#333' : '#f3f4f6'}} contentStyle={{backgroundColor: theme === 'dark' ? '#171717' : '#fff', border: `1px solid ${theme === 'dark' ? '#333' : '#e5e7eb'}`, color: theme === 'dark' ? '#fff' : '#000'}} itemStyle={{ color: theme === 'dark' ? '#fff' : '#000' }} />
                        <Bar dataKey="value" fill="#EF4444" radius={[0, 4, 4, 0]}>
                           {/* Custom colors for bars could go here */}
                        </Bar>
                      </BarChart>
                   </ResponsiveContainer>
                </div>
              </div>
           </div>
        </div>
      )}

      {view === 'Z_REPORTS' && (
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DAILY_CLOSES.map(report => (
                <button 
                  key={report.id}
                  onClick={() => setActiveReport(report)}
                  className={`p-6 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-100 shadow-sm ${report.status === 'OPEN' ? 'bg-gradient-to-br from-brand-red/10 to-white dark:to-neutral-900 border-brand-red' : 'bg-white dark:bg-brand-surface border-gray-200 dark:border-neutral-800 hover:border-gray-400 dark:hover:border-neutral-600'}`}
                >
                   <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white text-lg">{report.date.toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500 dark:text-neutral-400 font-mono">ID: {report.id}</div>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${report.status === 'OPEN' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400'}`}>
                        {report.status}
                      </span>
                   </div>
                   
                   <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-500">Net Sales</span>
                        <span className="text-gray-900 dark:text-white font-mono font-bold">{report.netSales.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-neutral-500">Variance</span>
                        <span className={`font-mono font-bold ${report.variance !== 0 ? 'text-red-500' : 'text-green-600 dark:text-green-500'}`}>{report.variance > 0 ? '+' : ''}{report.variance.toFixed(3)}</span>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-dashed border-gray-200 dark:border-neutral-700 text-xs text-gray-500 dark:text-neutral-500 flex items-center gap-1">
                      {report.status === 'OPEN' ? 'Click to reconcile & close' : `Closed by ${report.closedBy}`}
                   </div>
                </button>
              ))}
           </div>
        </div>
      )}

      {view === 'EXPENSES' && (
        <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
           <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50 dark:bg-neutral-900">
             <h3 className="font-bold text-gray-900 dark:text-white">Expense Log</h3>
             <button 
               onClick={() => setShowAddExpense(true)}
               className="flex items-center gap-2 text-sm font-bold bg-brand-red text-white px-4 py-2 rounded-lg hover:bg-brand-redHover shadow-lg shadow-red-900/20"
             >
               <Plus size={16} /> Add Expense
             </button>
           </div>
           <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-medium">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4">Payee</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 text-gray-700 dark:text-neutral-300 transition-colors">
                  <td className="p-4 text-gray-500 dark:text-neutral-500">{exp.date.toLocaleDateString()}</td>
                  <td className="p-4 text-gray-900 dark:text-white font-medium">{exp.description}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-[10px] font-bold uppercase">{exp.category}</span>
                  </td>
                  <td className="p-4">{exp.payee}</td>
                  <td className="p-4">
                    <span className={`text-xs flex items-center gap-1 ${exp.status === 'APPROVED' ? 'text-green-600 dark:text-green-500' : exp.status === 'REJECTED' ? 'text-red-600 dark:text-red-500' : 'text-yellow-600 dark:text-yellow-500'}`}>
                      {exp.status === 'APPROVED' ? <CheckCircle size={12}/> : exp.status === 'REJECTED' ? <X size={12}/> : <Clock size={12}/>} {exp.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-mono font-bold text-gray-900 dark:text-white">{exp.amount.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'PNL' && <PnLTable />}

    </div>
  );
};
