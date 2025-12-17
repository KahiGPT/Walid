
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GENERAL_SETTINGS, SYSTEM_USERS, ROLES_CONFIG, PRINTERS, BRANCHES } from '../constants';
import { GeneralSettings, SystemUser, Role, Printer, Branch, Permission } from '../types';
import { api } from '../api';

interface AppContextType {
  isLoading: boolean;
  settings: GeneralSettings;
  updateSettings: (newSettings: Partial<GeneralSettings>) => void;
  users: SystemUser[];
  addUser: (user: SystemUser) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  roles: Role[];
  updateRolePermissions: (roleId: string, permission: Permission) => void;
  printers: Printer[];
  addPrinter: (printer: Printer) => void;
  updatePrinter: (id: string, updates: Partial<Printer>) => void;
  removePrinter: (id: string) => void;
  branches: Branch[];
  addBranch: (branch: Branch) => void;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  // --- State Containers ---
  const [settings, setSettings] = useState<GeneralSettings>(GENERAL_SETTINGS);
  const [users, setUsers] = useState<SystemUser[]>(SYSTEM_USERS);
  const [branches, setBranches] = useState<Branch[]>(BRANCHES);
  const [roles, setRoles] = useState<Role[]>(ROLES_CONFIG);
  const [printers, setPrinters] = useState<Printer[]>(PRINTERS);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('foodika-theme');
      return (saved === 'light' || saved === 'dark') ? saved : 'light';
    }
    return 'light';
  });

  // --- Effects ---
  
  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('foodika-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // --- Load Initial Data from Backend ---
  useEffect(() => {
    const loadData = async () => {
      try {
        // Use allSettled to handle partial failures gracefully (e.g. if one table is missing but others work)
        const results = await Promise.allSettled([
          api.admin.getSettings(),
          api.admin.getUsers(),
          api.admin.getBranches()
        ]);

        const [settingsResult, usersResult, branchesResult] = results;

        // Settings
        if (settingsResult.status === 'fulfilled' && settingsResult.value && Object.keys(settingsResult.value).length > 0) {
          setSettings(prev => ({ ...prev, ...settingsResult.value }));
        }

        // Users
        if (usersResult.status === 'fulfilled' && Array.isArray(usersResult.value) && usersResult.value.length > 0) {
          setUsers(usersResult.value);
        }

        // Branches
        if (branchesResult.status === 'fulfilled' && Array.isArray(branchesResult.value) && branchesResult.value.length > 0) {
          setBranches(branchesResult.value);
        }

        // Check if all failed (Backend likely down)
        const allFailed = results.every(r => r.status === 'rejected');
        if (allFailed) {
          console.warn("Backend API unreachable. Application running in Offline/Demo mode with local data.");
        }

      } catch (error) {
        console.warn("Unexpected error during data initialization. Using local fallbacks.", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Actions (Write to Backend) ---
  
  const updateSettings = async (newSettings: Partial<GeneralSettings>) => {
    // Optimistic UI update
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      await api.admin.updateSettings({ ...settings, ...newSettings });
    } catch (err) {
      console.warn("Failed to save settings to backend (Offline Mode)", err);
    }
  };

  const addUser = async (user: SystemUser) => {
    // Optimistic
    setUsers(prev => [...prev, user]);
    try {
      await api.admin.saveUser(user);
    } catch (err) {
      console.warn("Failed to save user to backend (Offline Mode)", err);
    }
  };

  const updateUser = async (id: string, updates: Partial<SystemUser>) => {
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;
    
    const updatedData = { ...userToUpdate, ...updates };
    
    // Optimistic
    setUsers(prev => prev.map(u => u.id === id ? updatedData : u));
    
    try {
      await api.admin.saveUser(updatedData);
    } catch (err) {
      console.warn("Failed to update user in backend (Offline Mode)", err);
    }
  };

  const addBranch = async (branch: Branch) => {
    // Optimistic
    setBranches(prev => [...prev, branch]);
    try {
      await api.admin.saveBranch(branch);
    } catch (err) {
      console.warn("Failed to save branch to backend (Offline Mode)", err);
    }
  };

  const updateBranch = async (id: string, updates: Partial<Branch>) => {
    const branchToUpdate = branches.find(b => b.id === id);
    if (!branchToUpdate) return;

    const updatedData = { ...branchToUpdate, ...updates };

    setBranches(prev => prev.map(b => b.id === id ? updatedData : b));

    try {
      await api.admin.saveBranch(updatedData);
    } catch (err) {
      console.warn("Failed to update branch in backend (Offline Mode)", err);
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

  const addPrinter = (printer: Printer) => {
    setPrinters(prev => [...prev, printer]);
  };

  const updatePrinter = (id: string, updates: Partial<Printer>) => {
    setPrinters(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const removePrinter = (id: string) => {
    setPrinters(prev => prev.filter(p => p.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      isLoading,
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
      theme,
      toggleTheme
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
