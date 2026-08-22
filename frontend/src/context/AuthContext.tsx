import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const savedToken = localStorage.getItem("auth_token");
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:3001/api/auth/me", {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          // Sync with local user identity for collaborative cursors
          sessionStorage.setItem("collab_user_name", data.user.name);
        } else {
          // Token invalid or expired
          localStorage.removeItem("auth_token");
          setToken(null);
          setUser(null);
        }
      } catch {
        // Server might be unreachable; keep token for now or clear
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        sessionStorage.setItem("collab_user_name", data.user.name);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch {
      return { success: false, error: "Network error. Please check server connection." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success && data.token && data.user) {
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser(data.user);
        sessionStorage.setItem("collab_user_name", data.user.name);
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch {
      return { success: false, error: "Network error. Please check server connection." };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
