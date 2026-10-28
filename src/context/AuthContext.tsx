import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'kopidesondoro_auth_user_v1';

const defaultStaffAccounts: Array<AuthUser & { password: string }> = [
  {
    id: 'usr_admin_1',
    email: 'admin@sondoro.com',
    password: 'admin123',
    name: 'Owner & Admin Sondoro',
    role: 'admin',
  },
  {
    id: 'usr_cashier_1',
    email: 'kasir@sondoro.com',
    password: 'kasir123',
    name: 'Kasir Utama (Siti)',
    role: 'cashier',
  },
  {
    id: 'usr_kitchen_1',
    email: 'dapur@sondoro.com',
    password: 'dapur123',
    name: 'Kepala Barista & Koki',
    role: 'kitchen',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check account
    const matched = defaultStaffAccounts.find(
      (acc) =>
        (acc.email.toLowerCase() === cleanEmail || acc.role === cleanEmail) &&
        acc.password === cleanPass
    );

    if (matched) {
      const user: AuthUser = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        role: matched.role,
      };
      setCurrentUser(user);
      return { success: true };
    }

    return { success: false, error: 'Email/Username atau Password salah.' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
