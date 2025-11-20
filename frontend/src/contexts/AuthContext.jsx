// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const savedUser = JSON.parse(token);
        if (savedUser && savedUser.role) {
          setUser(savedUser);
        } else {
          localStorage.removeItem("token");
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    const dummyUsers = [
      { username: "admin", password: "admin", role: "admin" },
      { username: "kasir", password: "kasir", role: "cashier" },
      { username: "kustomer", password: "kustomer", role: "customer" },
    ];

    const user = dummyUsers.find(
      (u) => u.username === username.toLowerCase().trim() && u.password === password
    );

    if (user) {
      setUser(user);
      localStorage.setItem("token", JSON.stringify(user))
      return { success: true, role: user.role };
    } else {
      return { success: false, error: "Username atau Password salah" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};