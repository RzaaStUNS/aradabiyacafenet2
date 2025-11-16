// src/contexts/AuthContext.jsx
import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (username, password) => {
    const dummyUsers = [
      { username: "admin", email: "admin@aradabiya.com", password: "admin123", role: "admin" },
      { username: "kasir", email: "kasir@aradabiya.com", password: "kasir123", role: "cashier" },
      { username: "kustomer", email: "customer@aradabiya.com", password: "kustomer123", role: "customer" },
    ];

    const user = dummyUsers.find(
      (u) => u.username === username.toLowerCase().trim() && u.password === password
    );

    if (user) {
      setUser(user);
      return { success: true, role: user.role };
    } else {
      return { success: false, error: "Username atau Password salah" };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};