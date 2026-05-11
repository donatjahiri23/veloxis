"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  plan: string;
  is_active: boolean;
  created_at: string;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<string | null>;
  signUp: (username: string, password: string, fullName: string) => Promise<string | null>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = "veloxis-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (username: string, password: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Login failed";
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return null; // no error
    } catch {
      return "Something went wrong";
    }
  }, []);

  const signUp = useCallback(async (username: string, password: string, fullName: string): Promise<string | null> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        return data.error || "Signup failed";
      }

      setUser(data.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      return null; // no error
    } catch {
      return "Something went wrong";
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
