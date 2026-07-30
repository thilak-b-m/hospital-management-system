import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("hms_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("hms_token") || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password, role });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("hms_token", data.token);
      localStorage.setItem("hms_user", JSON.stringify(data.user));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Login failed" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", formData);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("hms_token", data.token);
      localStorage.setItem("hms_user", JSON.stringify(data.user));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("hms_token");
    localStorage.removeItem("hms_user");
    delete api.defaults.headers.common["Authorization"];
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("hms_user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
