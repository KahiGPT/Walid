import React, { createContext, useContext } from "react";

/**
 * Authentication has been removed. 
 * This file is kept as a non-functional placeholder to prevent breakage of legacy imports if they exist.
 */
const AuthContext = createContext<any>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthContext.Provider value={{ user: { email: 'admin@foodika.app', username: 'admin' }, loading: false }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return ctx;
}