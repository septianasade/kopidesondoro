import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StaffRole } from '../types';

export interface AuthContextType {
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  loginWithPassword: (email: string, password: string) => { success: boolean; user?: User; error?: string };
  loginWithPin: (pin: string) => { success: boolean; user?: User; error?: string };
  // Backwards compatibility alias
  login: (email: string, password: string) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  lockTerminal: () => void;
  // Staff Management (Admin only)
  addUser: (staff: { name: string; role: StaffRole; pin_code: string; email?: string | null }) => { success: boolean; user?: User; error?: string };
  updateUser: (id: string, updates: Partial<User>) => { success: boolean; error?: string };
  deleteUser: (id: string) => { success: boolean; error?: string };
  resetStaffPin: (id: string, newPin: string) => { success: boolean; error?: string };
}

const AUTH_SESSION_KEY = 'kopidesondoro_auth_session_v2';
const USERS_STORAGE_KEY = 'kopidesondoro_staff_users_v2';

export const initialStaffUsers: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Admin Back-Office',
    email: 'admin@toko.com',
    password_hash: 'admin123',
    pin_code: '111111',
    role: 'ADMIN',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr_cashier_1',
    name: 'Budi Kasir',
    email: null,
    password_hash: null,
    pin_code: '222222',
    role: 'CASHIER',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
  {
    id: 'usr_kitchen_1',
    name: 'Chef Dapur',
    email: null,
    password_hash: null,
    pin_code: '333333',
    role: 'KITCHEN',
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Staff Directory state (persisted)
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(USERS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return initialStaffUsers;
  });

  // 2. Active Session state (persisted)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch {
      // ignore
    }
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(currentUser));
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(AUTH_SESSION_KEY);
    }
  }, [currentUser]);

  // JALUR 1: Login Admin Back-Office (Email + Password)
  const loginWithPassword = (email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Check against users
    const matched = users.find((u) => {
      if (!u.is_active) return false;
      const isEmailMatch = u.email && u.email.toLowerCase() === cleanEmail;
      // Allow legacy admin@sondoro.com as alias for admin@toko.com
      const isLegacyMatch = (cleanEmail === 'admin@sondoro.com' && u.email === 'admin@toko.com');
      return (isEmailMatch || isLegacyMatch) && u.password_hash === cleanPass;
    });

    if (matched) {
      if (matched.role !== 'ADMIN') {
        return { success: false, error: 'Akses Ditolak: Jalur ini khusus untuk akun Admin Back-Office.' };
      }
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return { success: false, error: 'Email atau Kata Sandi salah.' };
  };

  // JALUR 2: Login Terminal Operasional (6-Digit PIN Pad Layar Sentuh)
  const loginWithPin = (pin: string): { success: boolean; user?: User; error?: string } => {
    const cleanPin = pin.trim();

    if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      return { success: false, error: 'PIN harus berupa 6 digit angka.' };
    }

    const matched = users.find((u) => u.is_active && u.pin_code === cleanPin);

    if (matched) {
      setCurrentUser(matched);
      return { success: true, user: matched };
    }

    return { success: false, error: 'PIN Salah! Silakan periksa kembali 6 digit PIN Anda.' };
  };

  const login = loginWithPassword;

  const logout = () => {
    setCurrentUser(null);
  };

  const lockTerminal = () => {
    setCurrentUser(null);
  };

  // Admin Staff Management Actions
  const addUser = (staff: { name: string; role: StaffRole; pin_code: string; email?: string | null }) => {
    const cleanPin = staff.pin_code.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      return { success: false, error: 'PIN wajib 6 digit angka.' };
    }

    // Check duplicate PIN
    if (users.some((u) => u.pin_code === cleanPin)) {
      return { success: false, error: 'PIN sudah digunakan oleh staf lain. Gunakan PIN unik.' };
    }

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: staff.name.trim(),
      email: staff.email?.trim() || null,
      password_hash: staff.role === 'ADMIN' ? 'admin123' : null,
      pin_code: cleanPin,
      role: staff.role,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    return { success: true, user: newUser };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    if (updates.pin_code) {
      const cleanPin = updates.pin_code.trim();
      if (!/^\d{6}$/.test(cleanPin)) {
        return { success: false, error: 'PIN wajib 6 digit angka.' };
      }
      if (users.some((u) => u.id !== id && u.pin_code === cleanPin)) {
        return { success: false, error: 'PIN sudah digunakan oleh staf lain.' };
      }
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    return { success: true };
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    if (!target) return { success: false, error: 'Staf tidak ditemukan.' };
    if (target.role === 'ADMIN' && users.filter((u) => u.role === 'ADMIN').length <= 1) {
      return { success: false, error: 'Tidak dapat menghapus satu-satunya akun Admin.' };
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser?.id === id) {
      logout();
    }
    return { success: true };
  };

  const resetStaffPin = (id: string, newPin: string) => {
    return updateUser(id, { pin_code: newPin });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: Boolean(currentUser),
        loginWithPassword,
        loginWithPin,
        login,
        logout,
        lockTerminal,
        addUser,
        updateUser,
        deleteUser,
        resetStaffPin,
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
