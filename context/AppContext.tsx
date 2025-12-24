import React, { createContext, useContext, useState, useEffect } from 'react';
import { GENERAL_SETTINGS, SYSTEM_USERS, ROLES_CONFIG, PRINTERS, BRANCHES, TABLES, RECENT_ORDERS } from '../constants';
import { GeneralSettings, SystemUser, Role, Printer, Branch, Permission, Table, Order, OrderStatus } from '../types';

interface AppContextType {
  isLoading: boolean;
  currentUser: SystemUser | null;
  signOut: () => Promise<void>;
  hasPermission: (perm: Permission) => boolean;
  settings: GeneralSettings;
  updateSettings: (newSettings: Partial<GeneralSettings>) => Promise<void>;
  users: SystemUser[];
  addUser: (user: SystemUser) => Promise<void>;
  updateUser: (id: string, updates: Partial<SystemUser>) => Promise<void>;
  roles: Role[];
  updateRolePermissions: (roleId: string, permission: Permission) => void;
  printers: Printer[];
  addPrinter: (printer: Printer) => void;
  updatePrinter: (id: string, updates: Partial<Printer>) => void;
  removePrinter: (id: string) => void;
  branches: Branch[];
  addBranch: (branch: Branch) => Promise<void>;
  updateBranch: (id: string, updates: Partial<Branch>) => Promise<void>;
  tables: Table[];
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  removeTable: (id: string) => void;
  liveOrders: Order[];
  placeOrder: (order: Order) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  completedOrders: Order[];
  setCompletedOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getSaved = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;
  try {
    return JSON.parse(saved, (key, value) => {
      if (['timestamp', 'date', 'lastLogin', 'joinDate', 'startDate'].includes(key)) {
        return new Date(value);
      }
      return value;
    });
  } catch {
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  
  const [settings, setSettings] = useState<GeneralSettings>(() => getSaved('foodika-settings', GENERAL_SETTINGS));
  const [users, setUsers] = useState<SystemUser[]>(() => getSaved('foodika-users', SYSTEM_USERS));
  const [branches, setBranches] = useState<Branch[]>(() => getSaved('foodika-branches', BRANCHES));
  const [roles, setRoles] = useState<Role[]>(() => getSaved('foodika-roles', ROLES_CONFIG));
  const [printers, setPrinters] = useState<Printer[]>(() => getSaved('foodika-printers', PRINTERS));
  const [tables, setTables] = useState<Table[]>(() => getSaved('foodika-tables', TABLES));
  
  const [liveOrders, setLiveOrders] = useState<Order[]>(() => getSaved('foodika-live-orders', RECENT_ORDERS));
  const [completedOrders, setCompletedOrders] = useState<Order[]>(() => getSaved('foodika-history', []));

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('foodika-theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });

  // Automatically login as admin for the demo
  useEffect(() => {
    const adminUser = users.find(u => u.username === 'admin') || users[0];
    setCurrentUser(adminUser);
    setIsLoading(false);
  }, [users]);

  // Persist local state
  useEffect(() => { localStorage.setItem('foodika-live-orders', JSON.stringify(liveOrders)); }, [liveOrders]);
  useEffect(() => { localStorage.setItem('foodika-history', JSON.stringify(completedOrders)); }, [completedOrders]);
  useEffect(() => { localStorage.setItem('foodika-settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('foodika-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('foodika-branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('foodika-roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('foodika-printers', JSON.stringify(printers)); }, [printers]);
  useEffect(() => { localStorage.setItem('foodika-tables', JSON.stringify(tables)); }, [tables]);

  const placeOrder = async (order: Order) => {
    setLiveOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setLiveOrders(prev => {
      const orderToUpdate = prev.find(o => o.id === orderId);
      if (!orderToUpdate) return prev;

      if (status === OrderStatus.COMPLETED) {
        setCompletedOrders(c => [{ ...orderToUpdate, status }, ...c]);
        return prev.filter(o => o.id !== orderId);
      }

      return prev.map(o => o.id === orderId ? { ...o, status } : o);
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('foodika-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const hasPermission = (perm: Permission): boolean => {
    if (!currentUser) return false;
    const role = roles.find(r => r.id === currentUser.roleId);
    return role?.permissions.includes(perm) || false;
  };

  const signOut = async () => {
    setCurrentUser(null);
    localStorage.clear();
    window.location.reload();
  };

  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addBranch = async (branch: Branch) => {
    setBranches(prev => [...prev, branch]);
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addUser = async (user: SystemUser) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUser = async (id: string, updates: Partial<SystemUser>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const updateRolePermissions = (roleId: string, permission: Permission) => {
    setRoles(prev => prev.map(role => {
      if (role.id !== roleId) return role;
      const hasPermission = role.permissions.includes(permission);
      const newPermissions = hasPermission 
        ? role.permissions.filter(p => p !== permission)
        : [...role.permissions, permission];
      return { ...role, permissions: newPermissions };
    }));
  };

  const addPrinter = (p: Printer) => setPrinters(prev => [...prev, p]);
  const updatePrinter = (id: string, u: Partial<Printer>) => setPrinters(prev => prev.map(p => p.id === id ? { ...p, ...u } : p));
  const removePrinter = (id: string) => setPrinters(prev => prev.filter(p => p.id !== id));
  const addTable = (t: Table) => setTables(prev => [...prev, t]);
  const updateTable = (id: string, u: Partial<Table>) => setTables(prev => prev.map(t => t.id === id ? { ...t, ...u } : t));
  const removeTable = (id: string) => setTables(prev => prev.filter(t => t.id !== id));

  return (
    <AppContext.Provider value={{ 
      isLoading,
      currentUser,
      signOut,
      hasPermission,
      settings, 
      updateSettings, 
      users, 
      addUser, 
      updateUser,
      roles,
      updateRolePermissions,
      printers,
      addPrinter,
      updatePrinter,
      removePrinter,
      branches,
      addBranch,
      updateBranch,
      tables,
      addTable,
      updateTable,
      removeTable,
      liveOrders,
      placeOrder,
      updateOrderStatus,
      completedOrders,
      setCompletedOrders,
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};