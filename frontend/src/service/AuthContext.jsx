import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../service/ApiService"

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check session

  // Check session on mount. If server has a valid cookie, it returns { user }.
  useEffect(() => {
    let mounted = true;
    const checkProfile = async () => {
      try {
        setLoading(true);
        const data = await authService.getProfile();
        if (!mounted) return;
        if (data?.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    checkProfile();

    return () => {
      mounted = false;
    };
  }, []);

  // LOGIN: expects server to set HttpOnly cookie and return { user }
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data?.user) {
      setUser(data.user); // keep in-memory only
      return { ok: true, user: data.user };
    }
    return { ok: false, message: data?.message || "Login failed" };
  };

  // REGISTER: forward response (server might auto-login or return a message)
  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  // LOGOUT: call server to clear cookie and clear local state
  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout call failed", e);
    } finally {
      setUser(null);
    }
  };

  // UPDATE: patch profile on server, update in-memory user if returned
  const updateProfile = async (updates) => {
    const data = await authService.updateProfile(updates);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
