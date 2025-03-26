import { createContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, we would check for a valid session cookie
        // Since we're using mock authentication, load from localStorage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await response.json();
      
      if (!data.user) {
        throw new Error("Login failed");
      }
      
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Set user ID in headers for subsequent authenticated requests
      // This is for our mock session system
      localStorage.setItem("userId", data.user.id.toString());
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
  };

  // Attach user ID to all fetch requests as a header
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        init = init || {};
        init.headers = {
          ...init.headers,
          "user-id": userId,
        };
      }
      return originalFetch.apply(window, [input, init] as any);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
