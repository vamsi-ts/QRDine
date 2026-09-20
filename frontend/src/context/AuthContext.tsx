import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import type { Role } from '../types';

interface AuthState {
  role: Role | null;
  name: string | null;
  login: (email: string, password: string) => Promise<Role>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(({ data }) => {
        setRole(data.role);
        setName(data.name);
      })
      .catch(() => {
        setRole(null);
        setName(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(email: string, password: string) {
    const { data } = await authApi.login(email, password);
    setRole(data.role);
    setName(data.name);
    return data.role;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Ignore
    } finally {
      setRole(null);
      setName(null);
    }
  }

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <AuthContext.Provider value={{ role, name, login, logout, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}