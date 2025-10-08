import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import api from '../services/api';

// This User type should match the user object returned by your backend's /auth/me endpoint
type User = {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Set the token in the header for the initial request
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const { data } = await api.get<User>('/auth/me');
          setUser(data);
        } catch (error) {
          console.error("Failed to fetch user on load", error);
          localStorage.removeItem('token'); // Invalid token
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const signIn = async (email: string, password:string) => {
    try {
      const { data } = await api.post<{ token: string }>('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      const { data: userData } = await api.get<User>('/auth/me');
      setUser(userData);
      return { user: userData, error: null };
    } catch (error) {
      console.error('Sign in failed', error);
      return { user: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await api.post('/auth/register', { name: fullName, email, password });
      return { error: null };
    } catch (error) {
      console.error('Sign up failed', error);
      return { error: error as Error };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};