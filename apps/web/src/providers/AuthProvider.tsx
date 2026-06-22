'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { type AuthSession } from '@/types';

interface AuthContextType {
  session: AuthSession | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading, logout } = useAuth();

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        logout,
        isAuthenticated: !!session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
