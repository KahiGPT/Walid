import React, { useState, useCallback, useEffect } from 'react';
import { Module, Branch, Order, OrderStatus, OrderType, Permission } from './types';
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
import { Analytics } from './components/Analytics';
import { CallCenter } from './components/CallCenter';
import { Messages } from './components/Messages';
import { AppProvider, useApp } from './context/AppContext'; 
import { LayoutDashboard, ShoppingCart, Archive, PieChart, Truck, Users, Settings as SettingsIcon, LogOut, ChefHat, Bike, Megaphone, DollarSign, CheckCircle, AlertCircle, Info, X, MapPin, Store, ChevronDown, Headphones, Sun, Moon, MessageSquare, Loader2, ShieldAlert } from 'lucide-react';

const FOODIKA_LOGO = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iI0RDMjYyNiIvPjxwYXRoIGQ9Ik0xNDYgMTUwSDM4NkwzMTYgMjIwSDIxNlYzODZIMTQ2VjE1MFoiIGZpbGw9IiNGRkZGRkYiLz48cGF0aCBkPSJNMjQ2IDI1MEgzNjBMMjQ2IDM2NFYyNTBaIiBmaWxsPSIjRkZGRkZGIi8+PC9zdmc+";

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: string; message: string; type: ToastType; }

const AccessDenied: React.FC<{ module: string }> = ({ module }) => (
  <div className="h-full w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black p-6 text-center animate-in fade-in duration-300">
    <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-500 mb-6">
       <ShieldAlert size={48} />
    </div>
    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Restricted</h2>
    <p className="text-gray-500 dark:text-neutral-400 mt-2 max-w-md">Your account role does not have permission to access the <strong>{module}</strong> module.</p>
  </div>
);

const MainLayout: React.FC = () => {
  const { 
    branches, theme, toggleTheme, signOut, isLoading, currentUser,
    liveOrders, placeOrder, updateOrderStatus, completedOrders, hasPermission
  } = useApp(); 
  
  const [activeModule, setActiveModule] = useState<Module>(Module.DASHBOARD);
  const [activeBranch, setActiveBranch] = useState<Branch | null>(null);
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  useEffect(() => { 
    if (branches && branches.length > 0 && !activeBranch) {
      setActiveBranch(branches[0]);
    }
  }, [branches, activeBranch]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 4000);
  }, []);

  const handlePlaceOrder = async (newOrder: Order) => {
    try {
      await placeOrder(newOrder);
      addToast('Order successfully sent to kitchen', 'success');
    } catch (e) {
      addToast('Failed to place order', 'error');
    }
  };

  const handleKDSBump = async (id: string) => {
    const order = liveOrders.find(o => o.id === id);
    if (!order) return;

    let nextStatus: OrderStatus = order.status;
    if (order.status === OrderStatus.PENDING) nextStatus = OrderStatus.KITCHEN;
    else if (order.status === OrderStatus.KITCHEN) nextStatus = OrderStatus.READY;
    else if (order.status === OrderStatus.READY) nextStatus = OrderStatus.COMPLETED;

    try {
      await updateOrderStatus(id, nextStatus);
      addToast(`Order ${id.split('-')[1] || id} updated to ${nextStatus}`, 'info');
    } catch (e) {
      addToast('Status update failed', 'error');
    }
  };

  if (isLoading) {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 dark:bg-black">
          <Loader2 className="w-12 h-12 text-brand-red animate-spin mb-4" />
          <p className="text-gray-500 font-bold animate-pulse">Initializing Foodika...</p>
        </div>
      );
  }

  const NavItem = ({ module, icon: Icon, label, requiredPermission }: { module: Module; icon: any; label: string, requiredPermission?: Permission }) => {
    if (requiredPermission && !hasPermission(requiredPermission)) return null;
    return (
      <button onClick={() => setActiveModule(module)}
        className={`w-full p-3 rounded-xl flex items-center gap-4 transition-all group ${ activeModule === module ? 'bg-brand-red text-white shadow-lg shadow-red-900/30' : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white' }`}
      >
        <Icon size={22} strokeWidth={activeModule === module ? 2.5 : 2} />
        <div className="text-left hidden lg:block"> <div className="font-medium text-sm">{label}</div> </div>
        {activeModule === module && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full lg:block hidden"></div>}
      </button>
    );
  };

  const renderModule = () => {
    switch(activeModule) {
      case Module.DASHBOARD: 
        return hasPermission('VIEW_DASHBOARD') ? <Dashboard onNavigate={setActiveModule} currentBranch={activeBranch || branches[0]} /> : <AccessDenied module="Dashboard" />;
      case Module.POS:
        return hasPermission('POS_ACCESS') ? <POS onNotify={addToast} currentBranch={activeBranch || branches[0]} onPlaceOrder={handlePlaceOrder} liveOrders={liveOrders} completedOrders={completedOrders} /> : <AccessDenied module="POS" />;
      case Module.KDS:
        return hasPermission('VIEW_DASHBOARD') ? <KDS tickets={liveOrders.filter(t => t.status !== OrderStatus.COMPLETED)} onBump={handleKDSBump} /> : <AccessDenied module="KDS" />;
      case Module.DISPATCHER:
        return hasPermission('POS_ACCESS') ? <Dispatcher orders={liveOrders} onUpdateOrder={(oid, action) => action === 'COMPLETE' ? updateOrderStatus(oid, OrderStatus.COMPLETED) : addToast('Dispatch Update Applied')} /> : <AccessDenied module="Dispatch" />;
      case Module.CALL_CENTER:
        return hasPermission('POS_ACCESS') ? <CallCenter onNotify={addToast} onPlaceOrder={handlePlaceOrder} /> : <AccessDenied module="Call Center" />;
      case Module.INVENTORY:
        return hasPermission('MANAGE_INVENTORY') ? <Inventory onNotify={addToast} /> : <AccessDenied module="Inventory" />;
      case Module.PURCHASING:
        return hasPermission('MANAGE_INVENTORY') ? <Purchasing /> : <AccessDenied module="Purchasing" />;
      case Module.HR:
        return hasPermission('MANAGE_STAFF') ? <HR /> : <AccessDenied module="HR" />;
      case Module.ACCOUNTING:
        return hasPermission('VIEW_REPORTS') ? <Accounting /> : <AccessDenied module="Accounting" />;
      case Module.MENU_ENGINEERING:
        return hasPermission('VIEW_REPORTS') ? <Analytics /> : <AccessDenied module="Analytics" />;
      case Module.MARKETING:
        return hasPermission('SYSTEM_SETTINGS') ? <Marketing /> : <AccessDenied module="Marketing" />;
      case Module.SETTINGS:
        return hasPermission('SYSTEM_SETTINGS') ? <Settings onNotify={addToast} /> : <AccessDenied module="Settings" />;
      case Module.MESSAGES:
        return <Messages onNotify={addToast} />;
      default:
        return <div className="p-10 text-center font-bold text-gray-500">Module Selection Error</div>;
    }
  };

  return (
    <div className={`flex h-screen w-full bg-gray-50 dark:bg-black text-gray-900 dark:text-white ltr overflow-hidden relative`}>
      <aside className="w-20 lg:w-64 flex flex-col border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-brand-surface z-20 transition-all duration-300 flex-shrink-0">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-200 dark:border-neutral-800">
          <img src={FOODIKA_LOGO} alt="Foodika" className="w-10 h-10 rounded-xl mr-0 lg:mr-3 object-contain" />
          <div className="hidden lg:block">
             <div className="font-bold text-xl tracking-tight leading-none text-gray-900 dark:text-white">Foodika</div>
             <button onClick={() => setShowBranchSelector(true)} className="text-[10px] text-gray-500 dark:text-neutral-400 mt-1 flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
               {activeBranch?.name.split(' - ')[0] || 'Select Branch'} <ChevronDown size={10} />
             </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
          <NavItem module={Module.DASHBOARD} icon={LayoutDashboard} label="Dashboard" requiredPermission="VIEW_DASHBOARD" />
          <NavItem module={Module.MENU_ENGINEERING} icon={PieChart} label="Analytics" requiredPermission="VIEW_REPORTS" />
          <NavItem module={Module.POS} icon={ShoppingCart} label="POS" requiredPermission="POS_ACCESS" />
          <NavItem module={Module.KDS} icon={ChefHat} label="Kitchen Display" requiredPermission="VIEW_DASHBOARD" />
          <NavItem module={Module.DISPATCHER} icon={Bike} label="Delivery & Dispatch" requiredPermission="POS_ACCESS" />
          <NavItem module={Module.CALL_CENTER} icon={Headphones} label="Call Center" requiredPermission="POS_ACCESS" />
          <NavItem module={Module.MARKETING} icon={Megaphone} label="Marketing & CRM" requiredPermission="SYSTEM_SETTINGS" />
          <NavItem module={Module.ACCOUNTING} icon={DollarSign} label="Accounting" requiredPermission="VIEW_REPORTS" />
          <NavItem module={Module.INVENTORY} icon={Archive} label="Inventory" requiredPermission="MANAGE_INVENTORY" />
          <div className="py-2"><div className="h-px bg-gray-200 dark:bg-neutral-800 mx-2"></div></div>
          <NavItem module={Module.PURCHASING} icon={Truck} label="Purchasing" requiredPermission="MANAGE_INVENTORY" />
          <NavItem module={Module.HR} icon={Users} label="Staff & HR" requiredPermission="MANAGE_STAFF" />
          <NavItem module={Module.MESSAGES} icon={MessageSquare} label="In House Chat" />
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 mt-auto">
          <div className="flex gap-2 mb-3">
            <button onClick={toggleTheme} className="flex-1 py-2 px-3 bg-gray-100 dark:bg-neutral-800 rounded-lg text-xs font-bold text-gray-500 dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-neutral-700">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} </button>
          </div>
          <div className="flex flex-col gap-2">
            <div onClick={() => hasPermission('SYSTEM_SETTINGS') && setActiveModule(Module.SETTINGS)} className={`flex items-center gap-3 px-2 cursor-pointer p-2 rounded-lg transition-colors ${activeModule === Module.SETTINGS ? 'bg-gray-200 dark:bg-neutral-800' : 'hover:bg-gray-100 dark:hover:bg-neutral-800'}`}>
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-neutral-700 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-white">
                {currentUser?.username?.slice(0, 2).toUpperCase() || 'DM'} </div>
              <div className="hidden lg:block overflow-hidden">
                <div className="text-sm font-medium text-gray-900 dark:text-white truncate"> {currentUser?.username || 'Demo User'} </div>
                <div className="text-xs text-gray-500 dark:text-neutral-500">{currentUser?.roleName || 'Staff'}</div>
              </div>
              <SettingsIcon size={18} className="ml-auto text-gray-400 dark:text-neutral-500" />
            </div>
            <button onClick={signOut} className="w-full p-2 flex items-center gap-3 text-gray-500 dark:text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
              <div className="w-8 flex justify-center"><LogOut size={18} /></div>
              <span className="text-xs font-bold hidden lg:block">Reset Session</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-brand-black relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map(toast => (
            <div key={toast.id} className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300 ${ toast.type === 'success' ? 'bg-white/90 dark:bg-neutral-900/90 border-green-200 dark:border-green-900 text-green-600 dark:text-green-400' : toast.type === 'error' ? 'bg-white/90 dark:bg-neutral-900/90 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400' : 'bg-white/90 dark:bg-neutral-900/90 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400' }`} >
              {toast.type === 'success' ? <CheckCircle size={18} /> : toast.type === 'error' ? <AlertCircle size={18} /> : <Info size={18} />}
              <span className="text-sm font-medium text-gray-900 dark:text-white">{toast.message}</span>
              <button onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))} className="ml-2 opacity-50 hover:opacity-100 text-gray-500 dark:text-white"> <X size={14} /> </button>
            </div>
          ))}
        </div>
        {renderModule()}
      </main>
    </div>
  );
};

const App: React.FC = () => { return ( <AppProvider> <MainLayout /> </AppProvider> ); };
export default App;