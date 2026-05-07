import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

interface User {
  username: string;
  email: string;
  userId: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
        apiService.setAuthToken(storedToken);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await apiService.login(username, password);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser({
        username: response.data.username,
        email: response.data.email,
        userId: response.data.userId,
      });
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        userId: response.data.userId,
      }));
      apiService.setAuthToken(response.data.token);
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await apiService.register(username, email, password);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser({
        username: response.data.username,
        email: response.data.email,
        userId: response.data.userId,
      });
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('auth_user', JSON.stringify({
        username: response.data.username,
        email: response.data.email,
        userId: response.data.userId,
      }));
      apiService.setAuthToken(response.data.token);
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    apiService.setAuthToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

