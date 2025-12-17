
import React, { useState, useCallback, useEffect } from 'react';
import { Module, Branch, Order, OrderStatus } from './types';
import { KDS_TICKETS, DISPATCH_ORDERS } from './constants';
import { Dashboard } from './components/Dashboard';
import { POS } from './components/POS';
import { Inventory } from './components/Inventory';
import { KDS } from './components/KDS';
import { Purchasing } from './components/Purchasing';
import { HR } from './components/HR';
import { Dispatcher } from './components/Dispatcher';
import { Marketing } from './components/Marketing';
import { Accounting } from './components/Accounting';
import { Settings } from './components/Settings';
import { Login } from './components/Login';
import { Analytics } from './components/Analytics';
import { CallCenter } from './components/CallCenter';
import { AppProvider, useApp } from './context/AppContext'; // Import Provider and Hook
import { LayoutDashboard, ShoppingCart, Archive, PieChart, Truck, Users, Settings as SettingsIcon, LogOut, Menu, ChefHat, Bike, Megaphone, DollarSign, CheckCircle, AlertCircle, Info, X, Lock, MapPin, Store, ChevronDown, Check, Headphones, Sun, Moon } from 'lucide-react';

// Toast Types
type ToastType = 'success' | 'error' | 'info';
interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

// Embedded SVG Logo - Geometric F Shape
const FOODIKA_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik0xNDYgMTUwSDM4NkwzMTYgMjIwSDIxNlYzODZIMTQ2VjE1MFoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMjQ2IDI1MEgzNjBMMjQ2IDM2NFYyNTBaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+";

const LockScreen = ({ onUnlock }: { onUnlock: () => void }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNum = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === '1234') {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white/95 dark:bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-6">
           <img 
             src={FOODIKA_LOGO}
             alt="Foodika" 
             className="w-24 h-24 rounded-3xl object-contain shadow-2xl shadow-red-900/20"
           />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Terminal Locked</h2>
        <p className="text-gray-500 dark:text-neutral-500">Enter PIN to resume session</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${pin.length > i ? (error ? 'bg-red-500 border-red-500' : 'bg-brand-red border-brand-red') : 'border-gray-300 dark:border-neutral-600 bg-transparent'}`}></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button 
            key={num}
            onClick={() => handleNum(num.toString())}
            className="h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all active:scale-95 border border-gray-200 dark:border-neutral-700 shadow-sm"
          >
            {num}
          </button>
        ))}
        <div className="col-start-2">
          <button 
            onClick={() => handleNum('0')}
            className="w-full h-16 rounded-2xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-900 dark:text-white text-2xl font-bold transition-all active:scale-95 border border-gray-200 dark:border-neutral-700 shadow-sm"
          >
            0
          </button>
        </div>
      </div>
      <button onClick={() => window.location.reload()} className="mt-8 text-gray-500 dark:text-neutral-500 text-sm hover:text-gray-900 dark:hover:text-white underline">Switch User</button>
    </div>
  );
};

const BranchSelector = ({ 
  current, 
  onSelect, 
  onClose 
}: { 
  current: Branch; 
  onSelect: (b: Branch) => void; 
  onClose: () => void 
}) => {
  const { branches } = useApp(); // Use Context

  return (
    <div className="fixed inset-0 z-[150] bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-brand-surface w-full max-w-md rounded-2xl border border-gray-200 dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col">
         <div className="p-5 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 flex justify-between items-center">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Store size={20} className="text-brand-red" /> Select Branch
            </h3>
            <button onClick={onClose}><X size={20} className="text-gray-500 dark:text-neutral-500 hover:text-gray-900 dark:hover:text-white" /></button>
         </div>
         <div className="p-2 space-y-1">
            {branches.map(b => (
              <button 
                key={b.id}
                onClick={() => { onSelect(b); onClose(); }}
                className={`w-full p-4 rounded-xl flex items-center justify-between group transition-all ${current.id === b.id ? 'bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700' : 'hover:bg-gray-50 dark:hover:bg-neutral-800/50 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center ${current.id === b.id ? 'bg-brand-red text-white' : 'bg-gray-200 dark:bg-neutral-900 text-gray-500 dark:text-neutral-500 group-hover:bg-gray-300 dark:group-hover:bg-neutral-800'}`}>
                     <MapPin size={20} />
                   </div>
                   <div className="text-left">
                      <div className={`font-bold text-sm ${current.id === b.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-neutral-300'}`}>{b.name}</div>
                      <div className="text-xs text-gray-500 dark:text-neutral-500">{b.type} • {b.currency}</div>
                   </div>
                </div>
                {current.id === b.id && <CheckCircle size={20} className="text-brand-red" />}
              </button>
            ))}
         </div>
      </div>
    </div>
  );
};

const MainLayout: React.FC = () => {
  const { branches, theme, toggleTheme } = useApp(); // Access branches from context
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [activeBranch, setActiveBranch] = useState<Branch>(branches[0]); // Initialize with first branch from context
  const [isRTL, setIsRTL] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  // Shared Order State (The "Central Database" for POS, KDS and Dispatcher)
  // We merge KDS tickets and Dispatch orders so both modules see the relevant data
  const [liveOrders, setLiveOrders] = useState<Order[]>([...KDS_TICKETS, ...DISPATCH_ORDERS]);

  // Toast System
  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Shared Handlers
  const handlePlaceOrder = (newOrder: Order) => {
    setLiveOrders(prev => [newOrder, ...prev]);
    // In a real app, this would also POST to the backend
  };

  const handleKDSBump = (id: string) => {
    setLiveOrders(prev => prev.map(t => {
      if (t.id === id) {
        if (t.status === OrderStatus.PENDING) return { ...t, status: OrderStatus.KITCHEN };
        // If bumped from kitchen, move to READY. 
        // This makes it visible to the Dispatcher if it's a Delivery/Takeaway order.
        return { ...t, status: OrderStatus.READY };
      }
      return t;
    }));
  };

  const handleDispatcherUpdate = (orderId: string, action: 'ASSIGN' | 'COMPLETE', driverId?: string, driverName?: string) => {
    setLiveOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (action === 'ASSIGN') {
          return {
            ...o,
            status: OrderStatus.OUT_FOR_DELIVERY,
            deliveryInfo: { ...o.deliveryInfo!, driverId, driverName }
          };
        } else if (action === 'COMPLETE') {
          return { ...o, status: OrderStatus.COMPLETED };
        }
      }
      return o;
    }));
    
    if (action === 'ASSIGN') addToast('Driver assigned successfully', 'success');
    if (action === 'COMPLETE') addToast('Order marked as completed', 'success');
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const NavItem = ({ module, icon: Icon, label, labelAr }: { module: Module; icon: any; label: string; labelAr: string }) => (
    <button
      onClick={() => setActiveModule(module)}
      className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all group ${
        activeModule === module 
          ? 'bg-brand-red text-white shadow-lg shadow-red-900/30' 
          : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white'
      }`}
    >
      <Icon size={22} strokeWidth={activeModule === module ? 2.5 : 2} />
      <div className="text-left hidden lg:block">
        <div className="font-medium text-sm">{label}</div>
        <div className={`text-[10px] opacity-60 ${isRTL ? 'text-right' : ''}`}>{labelAr}</div>
      </div>
      {activeModule === module && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full lg:block hidden"></div>}
    </button>
  );

  return (
    <div className={`flex h-screen w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-white ${isRTL ? 'rtl' : 'ltr'} overflow-hidden relative`}>
      
      {isLocked && <LockScreen onUnlock={() => setIsLocked(false)} />}
      {showBranchSelector && (
        <BranchSelector 
          current={activeBranch} 
          onSelect={(b) => { setActiveBranch(b); addToast(`Switched to ${b.name}`, 'info'); }} 
          onClose={() => setShowBranchSelector(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-brand-surface z-20 transition-all duration-300 flex-shrink-0">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-neutral-800">
          <img 
            src={FOODIKA_LOGO}
            alt="Foodika" 
            className="w-10 h-10 rounded-xl mr-0 lg:mr-3 object-contain"
          />
          <div className="hidden lg:block">
             <div className="font-bold text-xl tracking-tight leading-none text-gray-900 dark:text-white">Foodika</div>
             <button 
               onClick={() => setShowBranchSelector(true)}
               className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors"
             >
               {activeBranch?.name.split(' - ')[0] || 'Select Branch'} <ChevronDown size={10} />
             </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
          <NavItem module={Module.DASHBOARD} icon={LayoutDashboard} label="Dashboard" labelAr="لوحة القيادة" />
          <NavItem module={Module.MENU_ENGINEERING} icon={PieChart} label="Analytics" labelAr="التحليلات" />
          <NavItem module={Module.POS} icon={ShoppingCart} label="POS" labelAr="نقاط البيع" />
          <NavItem module={Module.KDS} icon={ChefHat} label="Kitchen Display" labelAr="شاشة المطبخ" />
          <NavItem module={Module.DISPATCHER} icon={Bike} label="Delivery & Dispatch" labelAr="التوصيل" />
          <NavItem module={Module.CALL_CENTER} icon={Headphones} label="Call Center" labelAr="مركز الاتصال" />
          <NavItem module={Module.MARKETING} icon={Megaphone} label="Marketing & CRM" labelAr="التسويق" />
          <NavItem module={Module.ACCOUNTING} icon={DollarSign} label="Accounting" labelAr="المحاسبة" />
          <NavItem module={Module.INVENTORY} icon={Archive} label="Inventory" labelAr="المخزون" />
          
          <div className="py-2">
            <div className="h-px bg-gray-200 dark:bg-neutral-800 mx-2"></div>
          </div>
          
          <NavItem module={Module.PURCHASING} icon={Truck} label="Purchasing" labelAr="المشتريات" />
          <NavItem module={Module.HR} icon={Users} label="Staff & HR" labelAr="الموظفين" />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 mt-auto">
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setIsRTL(!isRTL)}
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-gray-200 dark:hover:bg-neutral-700 flex items-center justify-center gap-2"
            >
              {isRTL ? 'ENG' : 'عربي'}
            </button>
            <button 
              onClick={toggleTheme}
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-neutral-700"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button 
              onClick={() => setIsLocked(true)}
              className="flex-1 py-2 px-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-neutral-700"
              title="Lock Screen"
            >
              <Lock size={14} /> Lock
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <div 
              onClick={() => setActiveModule(Module.SETTINGS)}
              className={`flex items-center gap-3 px-2 cursor-pointer p-2 rounded-lg transition-colors ${activeModule === Module.SETTINGS ? 'bg-gray-200 dark:bg-neutral-800' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}
            >
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">AD</div>
              <div className="hidden lg:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Admin User</div>
                <div className="text-xs text-gray-500 dark:text-neutral-500">Manager</div>
              </div>
              <SettingsIcon size={18} className="ml-auto text-gray-400 dark:text-neutral-500" />
            </div>

            <button 
              onClick={() => setIsAuthenticated(false)}
              className="w-full p-2 flex items-center gap-3 text-gray-500 dark:text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
            >
              <div className="w-8 flex justify-center"><LogOut size={18} /></div>
              <span className="text-xs font-bold hidden lg:block">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-brand-black relative">
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Global Toast Container */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div 
              key={toast.id} 
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 ${
                toast.type === 'success' ? 'bg-white/90 dark:bg-neutral-900/90 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400' :
                toast.type === 'error' ? 'bg-white/90 dark:bg-neutral-900/90 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' :
                'bg-white/90 dark:bg-neutral-900/90 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle size={18} /> : 
               toast.type === 'error' ? <AlertCircle size={18} /> : 
               <Info size={18} />}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-50 hover:opacity-100 text-gray-500 dark:text-white">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Modules with Props passed */}
        {activeModule === Module.DASHBOARD && <Dashboard onNavigate={setActiveModule} currentBranch={activeBranch} />}
        {activeModule === Module.POS && <POS onNotify={addToast} currentBranch={activeBranch} onPlaceOrder={handlePlaceOrder} />}
        
        {/* KDS and Dispatcher now share the liveOrders state */}
        {activeModule === Module.KDS && (
          <KDS 
            tickets={liveOrders.filter(t => t.status !== OrderStatus.READY && t.status !== OrderStatus.OUT_FOR_DELIVERY && t.status !== OrderStatus.COMPLETED)} 
            onBump={handleKDSBump} 
          />
        )}
        {activeModule === Module.DISPATCHER && (
          <Dispatcher 
            orders={liveOrders} 
            onUpdateOrder={handleDispatcherUpdate} 
          />
        )}

        {activeModule === Module.PURCHASING && <Purchasing />}
        {activeModule === Module.HR && <HR />}
        {activeModule === Module.MARKETING && <Marketing />}
        {activeModule === Module.ACCOUNTING && <Accounting />}
        {activeModule === Module.SETTINGS && <Settings onNotify={addToast} />}
        {activeModule === Module.MENU_ENGINEERING && <Analytics />}
        {activeModule === Module.CALL_CENTER && <CallCenter onNotify={addToast} onPlaceOrder={handlePlaceOrder} />}
        {(activeModule === Module.INVENTORY || activeModule === Module.RECIPES) && <Inventory onNotify={addToast} />}
        
        {/* Fallback for unfinished modules */}
        {![Module.DASHBOARD, Module.POS, Module.INVENTORY, Module.RECIPES, Module.KDS, Module.PURCHASING, Module.HR, Module.DISPATCHER, Module.MARKETING, Module.ACCOUNTING, Module.SETTINGS, Module.MENU_ENGINEERING, Module.CALL_CENTER].includes(activeModule) && (
           <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-neutral-500">
             <SettingsIcon size={64} className="mb-6 opacity-20" />
             <h2 className="text-xl font-medium text-gray-700 dark:text-neutral-300">Module Under Construction</h2>
             <p className="mt-2 text-sm">The {activeModule} module is included in the Enterprise plan.</p>
           </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
};

export default App;
