
import React, { useState } from 'react';
import { STAFF_ROSTER, SHIFTS, ATTENDANCE_LOG } from '../constants';
import { StaffMember, Shift } from '../types';
import { 
  Users, Calendar, Clock, Plus, Search, MoreVertical, 
  ChevronLeft, ChevronRight, Copy, Save, Filter, 
  CheckCircle, XCircle, AlertCircle, Phone
} from 'lucide-react';

export const HR: React.FC = () => {
  const [view, setView] = useState<'ROSTER' | 'SCHEDULE' | 'ATTENDANCE'>('ROSTER');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Schedule Date State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Calculate current week days based on currentDate
  const currentDay = currentDate.getDay(); // 0 is Sunday
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDay); // Start on Sunday
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  const filteredStaff = STAFF_ROSTER.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 dark:bg-brand-black p-6 flex flex-col space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-brand-red" /> Staff & HR
          </h1>
          <p className="text-gray-500 dark:text-neutral-400 text-sm mt-1">Manage roster, shifts, and attendance.</p>
        </div>
        
        <div className="flex bg-gray-200 dark:bg-neutral-900 p-1 rounded-lg border border-gray-300 dark:border-neutral-800">
           <button onClick={() => setView('ROSTER')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'ROSTER' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
             <Users size={16}/> Roster
           </button>
           <button onClick={() => setView('SCHEDULE')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'SCHEDULE' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
             <Calendar size={16}/> Schedule
           </button>
           <button onClick={() => setView('ATTENDANCE')} className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${view === 'ATTENDANCE' ? 'bg-white dark:bg-neutral-800 text-black dark:text-white shadow-sm' : 'text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white'}`}>
             <Clock size={16}/> Attendance
           </button>
        </div>
      </div>

      {/* ROSTER VIEW */}
      {view === 'ROSTER' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-neutral-500" />
               <input 
                 type="text" 
                 placeholder="Search staff..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 className="w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg py-2 pl-9 pr-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-brand-red"
               />
            </div>
            <button className="bg-brand-red hover:bg-brand-redHover text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/20">
               <Plus size={18} /> Add Employee
            </button>
          </div>

          <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 dark:bg-neutral-900 text-gray-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Performance</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filteredStaff.map(staff => (
                  <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-gray-700 dark:text-neutral-300">
                    <td className="p-4">
                       <div className="font-bold text-gray-900 dark:text-white">{staff.fullName}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">ID: {staff.id}</div>
                    </td>
                    <td className="p-4">
                       <span className="bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 px-2 py-1 rounded text-xs font-bold uppercase">{staff.role}</span>
                    </td>
                    <td className="p-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded ${staff.status === 'ACTIVE' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500'}`}>
                         {staff.status.replace('_', ' ')}
                       </span>
                    </td>
                    <td className="p-4">
                       <div className="flex items-center gap-2">
                         <div className="w-24 h-2 bg-gray-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500" style={{ width: `${staff.performanceScore}%` }}></div>
                         </div>
                         <span className="font-mono text-xs">{staff.performanceScore}%</span>
                       </div>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-neutral-400">
                       <div className="flex items-center gap-2"><Phone size={12}/> {staff.phone}</div>
                    </td>
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

      {/* SCHEDULE VIEW */}
      {view === 'SCHEDULE' && (
        <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col h-[600px] shadow-sm">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-100 dark:bg-neutral-900">
            <div className="flex items-center gap-4">
              <div className="flex bg-white dark:bg-neutral-800 rounded-lg p-1 border border-gray-200 dark:border-transparent">
                <button onClick={prevWeek} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"><ChevronLeft size={20} /></button>
                <button onClick={nextWeek} className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"><ChevronRight size={20} /></button>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">
                {days[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {days[6].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 hover:border-gray-400 dark:hover:border-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-700 text-gray-900 dark:text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-all">
                <Copy size={16} /> Copy Last Week
              </button>
              <button className="px-4 py-2 bg-brand-red hover:bg-brand-redHover text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/20 transition-all active:scale-95">
                <Save size={16} /> Publish Schedule
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto">
             <div className="min-w-[1000px]">
                <div className="grid grid-cols-8 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 sticky top-0 z-10">
                   <div className="p-3 font-bold text-gray-500 dark:text-neutral-500 text-xs uppercase tracking-wider">Staff Member</div>
                   {days.map(d => (
                     <div key={d.toString()} className="p-3 text-center border-l border-gray-200 dark:border-neutral-800">
                       <div className="text-xs font-bold text-gray-900 dark:text-white uppercase">{d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">{d.getDate()}</div>
                     </div>
                   ))}
                </div>
                
                {STAFF_ROSTER.map(staff => (
                  <div key={staff.id} className="grid grid-cols-8 border-b border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/20 transition-colors">
                     <div className="p-3 flex items-center">
                        <div>
                           <div className="font-bold text-gray-900 dark:text-white text-sm">{staff.fullName}</div>
                           <div className="text-[10px] text-gray-500 dark:text-neutral-500">{staff.role}</div>
                        </div>
                     </div>
                     {days.map((d, idx) => {
                        // Dummy logic to populate shifts based on index for visual
                        const hasShift = (idx + STAFF_ROSTER.indexOf(staff)) % 3 !== 0; 
                        return (
                          <div key={idx} className="p-2 border-l border-gray-200 dark:border-neutral-800 min-h-[60px] relative group cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800/40">
                             {hasShift ? (
                               <div className="bg-brand-red/10 border border-brand-red/30 rounded p-1.5 h-full flex flex-col justify-center">
                                  <div className="text-xs font-bold text-gray-900 dark:text-white">09:00 - 17:00</div>
                                  <div className="text-[10px] text-gray-500 dark:text-neutral-400">{staff.role}</div>
                               </div>
                             ) : (
                               <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Plus size={16} className="text-gray-400 dark:text-neutral-600" />
                               </div>
                             )}
                          </div>
                        );
                     })}
                  </div>
                ))}
             </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE VIEW */}
      {view === 'ATTENDANCE' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-brand-surface rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden shadow-sm">
             <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-100 dark:bg-neutral-900 flex justify-between items-center">
               <h3 className="font-bold text-gray-900 dark:text-white">Attendance Log (Today)</h3>
               <button className="text-xs bg-white dark:bg-neutral-800 px-3 py-1.5 rounded text-gray-600 dark:text-neutral-300 border border-gray-300 dark:border-neutral-700 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-neutral-700">
                 <Filter size={14}/> Filter
               </button>
             </div>
             <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 font-medium">
                <tr>
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check In</th>
                  <th className="p-4">Check Out</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-800">
                {ATTENDANCE_LOG.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors text-gray-700 dark:text-neutral-300">
                    <td className="p-4">
                       <div className="font-bold text-gray-900 dark:text-white">{log.staffName}</div>
                       <div className="text-xs text-gray-500 dark:text-neutral-500">ID: {log.staffId}</div>
                    </td>
                    <td className="p-4 text-gray-500 dark:text-neutral-400">
                       {log.date.toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono text-gray-900 dark:text-white">
                       {log.checkIn || '--:--'}
                    </td>
                    <td className="p-4 font-mono text-gray-500 dark:text-neutral-500">
                       {log.checkOut || '--:--'}
                    </td>
                    <td className="p-4">
                       <span className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 w-fit ${log.status === 'PRESENT' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-500' : log.status === 'LATE' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-500' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-500'}`}>
                         {log.status === 'PRESENT' ? <CheckCircle size={12}/> : log.status === 'LATE' ? <AlertCircle size={12}/> : <XCircle size={12}/>}
                         {log.status}
                       </span>
                    </td>
                    <td className="p-4 text-center">
                       <button className="text-xs text-gray-500 dark:text-neutral-500 hover:text-black dark:hover:text-white underline">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
