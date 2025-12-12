// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const USER_STORAGE_KEY = "aradabiya_user";

export default function ProtectedRoute({ roles, children }) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
  } catch {
    user = null;
  }

  // belum login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // role tidak diizinkan
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // OK
  return children;
}
